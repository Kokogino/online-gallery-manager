import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import {
  AndFilterExpressionDto,
  FilterExpressionDto,
  NotFilterExpressionDto,
  OrFilterExpressionDto,
  TagFilterExpressionDto,
  TagResponse,
} from '@app/gen/ogm-backend';
import { compareStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';

export class FilterQueryUtil {
  public static validFilterQuery(tags$: Observable<TagResponse[]>): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> =>
      tags$.pipe(
        map((tags) => {
          const query = control.value.trim();
          if (query.length === 0) {
            return null;
          }
          const tokens = FilterQueryUtil.tokenizeQuery(query);
          let previousToken: string;
          let currentToken: string;
          for (let i = 0; i < tokens.length; i++) {
            previousToken = tokens[i - 1];
            currentToken = tokens[i];
            if (previousToken === undefined || previousToken.toUpperCase() === 'AND' || previousToken.toUpperCase() === 'OR') {
              if (currentToken.toUpperCase() !== 'NOT' && !FilterQueryUtil.isValidTag(currentToken, tags)) {
                return { validFilterQuery: `No tag found with name ${currentToken}` };
              }
            } else if (previousToken.toUpperCase() === 'NOT') {
              if (!FilterQueryUtil.isValidTag(currentToken, tags)) {
                return { validFilterQuery: `No tag found with name ${currentToken}` };
              }
            } else {
              if (currentToken.toUpperCase() !== 'AND' && currentToken.toUpperCase() !== 'OR') {
                return { validFilterQuery: `Only AND or OR are allowed after ${previousToken}` };
              }
            }
          }
          if (['NOT', 'AND', 'OR'].includes(currentToken.toUpperCase())) {
            return { validFilterQuery: `Query must end with a tag.` };
          }
          return null;
        }),
        first(),
      );
  }

  public static tokenizeQuery(query: string): string[] {
    const tokens: string[] = [];
    const splitQuery = query?.split(' ') || [];
    let currentToken = '';
    let isTag = false;
    for (let part of splitQuery) {
      if (part.startsWith('"')) {
        isTag = true;
        currentToken += part;
      } else {
        if (isTag) {
          currentToken += ` ${part}`;
        } else {
          tokens.push(part);
        }
      }
      if (part.endsWith('"')) {
        isTag = false;
        tokens.push(currentToken);
        currentToken = '';
      }
    }
    if (isTag) {
      tokens.push(currentToken);
    }
    return tokens;
  }

  public static filterExpressionToQuery(filter: FilterExpressionDto, tags: TagResponse[]): string {
    switch (filter.objectType) {
      case 'tag':
        return FilterQueryUtil.createTokenForTagId((filter as TagFilterExpressionDto).tagId, tags);
      case 'not':
        const tagFilter = filter as NotFilterExpressionDto;
        return `NOT ${FilterQueryUtil.filterExpressionToQuery(tagFilter.expression, tags)}`;
      case 'and':
        const andFilter = filter as AndFilterExpressionDto;
        return `${FilterQueryUtil.filterExpressionToQuery(andFilter.first, tags)} AND ${FilterQueryUtil.filterExpressionToQuery(andFilter.second, tags)}`;
      case 'or':
        const orFilter = filter as OrFilterExpressionDto;
        return `${FilterQueryUtil.filterExpressionToQuery(orFilter.first, tags)} OR ${FilterQueryUtil.filterExpressionToQuery(orFilter.second, tags)}`;
    }
    return '';
  }

  public static tokensToFilterExpression(
    tokens: string[],
    tags: TagResponse[],
    previousExpression?: FilterExpressionDto,
  ): FilterExpressionDto {
    const firstToken = tokens[0];
    switch (firstToken.toUpperCase()) {
      case 'AND':
        const nextNumberOfTokens = tokens[1].toUpperCase() === 'NOT' ? 3 : 2;
        const second = this.tokensToFilterExpression(tokens.slice(1, nextNumberOfTokens), tags);
        const andFilter: AndFilterExpressionDto = {
          objectType: 'and',
          first: previousExpression,
          second,
        };
        if (tokens.length > nextNumberOfTokens) {
          return this.tokensToFilterExpression(tokens.slice(nextNumberOfTokens), tags, andFilter);
        }
        return andFilter;
      case 'OR':
        return {
          objectType: 'or',
          first: previousExpression,
          second: this.tokensToFilterExpression(tokens.slice(1), tags),
        };
      case 'NOT':
        const notFilter: NotFilterExpressionDto = {
          objectType: 'not',
          expression: this.tokensToFilterExpression(tokens.slice(1, 2), tags),
        };
        if (tokens.length > 2) {
          return this.tokensToFilterExpression(tokens.slice(2), tags, notFilter);
        }
        return notFilter;
      default:
        const tagFilter: TagFilterExpressionDto = {
          objectType: 'tag',
          tagId: this.findTagIdForToken(firstToken, tags),
        };
        if (tokens.length > 1) {
          return this.tokensToFilterExpression(tokens.slice(1), tags, tagFilter);
        }
        return tagFilter;
    }
  }

  private static findTagIdForToken(token: string, tags: TagResponse[]): number {
    const tagName = token.replace(/^"+|"+$/g, '');
    return tags.find((tag) => compareStringsIgnoringAccentsAndCase(tag.name, tagName) === 0).id;
  }

  private static isValidTag(token: string, tags: TagResponse[]): boolean {
    const tagName = token.replace(/^"+|"+$/g, '');
    return tags.findIndex((tag) => compareStringsIgnoringAccentsAndCase(tag.name, tagName) === 0) > -1;
  }

  private static createTokenForTagId(tagId: number, tags: TagResponse[]): string {
    return `"${tags.find((tag) => tag.id === tagId).name}"`;
  }
}
