// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

import { hasRated, markAsRated } from '@/utils/ratings';

afterEach(() => {
    window.localStorage.clear();
});

describe('ratings utils', () => {
    it('reports hasRated as false initially', () => {
        expect(hasRated(1)).toBe(false);
    });

    it('persists markAsRated across reads (simulating a reload)', () => {
        markAsRated(1);

        expect(hasRated(1)).toBe(true);
        expect(hasRated(2)).toBe(false);
    });

    it('does not duplicate entries when marking the same teacher twice', () => {
        markAsRated(1);
        markAsRated(1);

        const raw = window.localStorage.getItem('proffy:rated-teachers');
        expect(JSON.parse(raw!)).toEqual([1]);
    });
});
