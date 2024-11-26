import { Component, ElementRef, OnDestroy, OnInit, Self, viewChild } from '@angular/core';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { MatInput, MatSuffix } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FilterExpressionDto, TagResponse, TagService } from '@app/gen/ogm-backend';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, finalize, map, Observable, startWith, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { containsStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';
import { FilterQueryUtil } from '@app/shared/util/filter-query-util';

@Component({
  selector: 'ogm-filter-query-input',
  imports: [
    MatFormField,
    MatAutocomplete,
    ReactiveFormsModule,
    MatInput,
    MatIconButton,
    MatIcon,
    MatOption,
    MatAutocompleteTrigger,
    AsyncPipe,
    MatLabel,
    MatError,
    MatSuffix,
  ],
  templateUrl: './filter-query-input.component.html',
  styleUrl: './filter-query-input.component.scss',
})
export class FilterQueryInputComponent extends DefaultControlValueAccessor<FilterExpressionDto> implements OnInit, OnDestroy {
  readonly formFieldControl = viewChild<MatInput>('hiddenInput');

  readonly autoTrigger = viewChild<MatAutocompleteTrigger>('autoTrigger');

  readonly queryInput = viewChild<ElementRef<HTMLInputElement>>('queryInput');

  queryControl: FormControl<string>;

  allTags = new BehaviorSubject<TagResponse[]>(undefined);

  loadingTags = true;

  filteredTokens$: Observable<string[]>;

  querySubscription: Subscription;
  controlSubscription: Subscription;

  constructor(
    @Self() ngControl: NgControl,
    private readonly tagService: TagService,
  ) {
    super(ngControl);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.queryControl = new FormControl('', [], FilterQueryUtil.validFilterQuery(this.allTags.asObservable()));

    this.filteredTokens$ = combineLatest([this.queryControl.valueChanges.pipe(startWith(this.queryControl.value)), this.allTags]).pipe(
      map(([query, tags]) => this.calculateNextTokens(query, tags)),
    );

    this.tagService
      .getAllTags()
      .pipe(finalize(() => (this.loadingTags = false)))
      .subscribe((tags) => this.allTags.next(tags));

    this.querySubscription = this.queryControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((query) => this.control.setValue(this.createFilterExpression(query)));
    this.controlSubscription = combineLatest([
      this.control.valueChanges.pipe(startWith(this.control.value), distinctUntilChanged()),
      this.allTags,
    ])
      .pipe(filter(([filter, tags]) => Boolean(filter) && Boolean(tags)))
      .subscribe(([filter, tags]) => {
        if (!this.queryControl.value) {
          this.queryControl.setValue(FilterQueryUtil.filterExpressionToQuery(filter, tags) + ' ');
        }
      });
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.controlSubscription?.unsubscribe();
  }

  public addTag(tag: TagResponse): void {
    const query = this.queryControl.value?.trim();
    const tokens = FilterQueryUtil.tokenizeQuery(query);
    const lastToken = tokens[tokens.length - 1];
    if (lastToken === undefined || ['NOT', 'AND', 'OR'].includes(lastToken.toUpperCase())) {
      this.queryControl.setValue(this.tokensToQuery([...tokens, `"${tag.name}"`]) + ' ');
    } else {
      tokens.pop();
      this.queryControl.setValue(this.tokensToQuery([...tokens, `"${tag.name}"`]) + ' ');
    }
  }

  public focus(): void {
    this.queryInput().nativeElement.focus();
  }

  clearFilter(): void {
    this.queryControl.setValue('');
  }

  selectToken(): void {
    requestAnimationFrame(() => this.autoTrigger().openPanel());
  }

  tokensExceptLast(): string {
    const tokens = FilterQueryUtil.tokenizeQuery(this.queryControl.value?.trimStart());
    tokens.pop();
    if (tokens.length > 0) {
      return this.tokensToQuery(tokens) + ' ';
    }
    return this.tokensToQuery(tokens);
  }

  private calculateNextTokens(query: string, tags: TagResponse[]): string[] {
    const tokens = FilterQueryUtil.tokenizeQuery(query.trimStart());
    const lastToken = tokens[tokens.length - 2];
    const currentToken = tokens[tokens.length - 1];
    const tagNames = (tags ?? []).map((tag) => `"${tag.name}"`);

    if (lastToken === undefined || lastToken.toUpperCase() === 'AND' || lastToken.toUpperCase() === 'OR') {
      return ['NOT', ...tagNames].filter((token) => containsStringsIgnoringAccentsAndCase(token, currentToken));
    }
    if (lastToken.toUpperCase() === 'NOT') {
      return tagNames.filter((token) => containsStringsIgnoringAccentsAndCase(token, currentToken));
    }
    return ['AND', 'OR'].filter((token) => containsStringsIgnoringAccentsAndCase(token, currentToken));
  }

  private tokensToQuery(tokens: string[]): string {
    return tokens.join(' ');
  }

  private createFilterExpression(query: string): FilterExpressionDto {
    if (!this.queryControl.valid || !query || query?.trim().length === 0) {
      return undefined;
    }
    return FilterQueryUtil.tokensToFilterExpression(FilterQueryUtil.tokenizeQuery(query.trim()), this.allTags.value);
  }
}
