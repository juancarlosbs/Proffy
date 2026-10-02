// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

import {
    addFavorite,
    getFavorites,
    toggleFavorite,
    updateFavoriteSchedule,
} from '@/utils/favorites';
import { Teacher } from '@/components/TeacherItem';

afterEach(() => {
    window.localStorage.clear();
});

const teacher: Teacher = {
    id: 1,
    avatar: 'https://example.com/avatar.png',
    bio: 'bio',
    cost: 50,
    name: 'Alan Turing',
    subject: 'Matemática',
    whatsapp: '5511999999999',
    schedule: [{ week_day: 1, from: '08:00', to: '12:00' }],
};

describe('favorites utils', () => {
    it('persists the schedule already present on the teacher when favoriting', () => {
        toggleFavorite(teacher);

        expect(getFavorites()).toEqual([teacher]);
    });

    it('updates the schedule of a stored favorite without touching other fields', () => {
        addFavorite({ ...teacher, schedule: undefined });

        updateFavoriteSchedule(teacher.id, [
            { week_day: 2, from: '10:00', to: '11:00' },
        ]);

        expect(getFavorites()[0].schedule).toEqual([
            { week_day: 2, from: '10:00', to: '11:00' },
        ]);
        expect(getFavorites()[0].name).toBe(teacher.name);
    });
});
