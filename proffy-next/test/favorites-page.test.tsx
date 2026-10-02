// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { ImgHTMLAttributes } from 'react';

vi.mock('next/image', () => ({
    default: (props: ImgHTMLAttributes<HTMLImageElement>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...props} alt={props.alt ?? ''} />
    ),
}));

import Favorites from '@/app/favorites/page';

const STORAGE_KEY = 'proffy:favorite-teachers';

const teacher = {
    id: 1,
    avatar: 'https://example.com/avatar.png',
    bio: 'Uma breve biografia',
    cost: 50,
    name: 'Alan Turing',
    subject: 'Matemática',
    whatsapp: '5511999999999',
};

beforeEach(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([teacher]));
});

afterEach(() => {
    window.localStorage.clear();
    cleanup();
});

describe('Favorites page', () => {
    it('removes the teacher card immediately after unfavoriting it', () => {
        render(<Favorites />);

        expect(screen.getByText(teacher.name)).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', { name: /remover dos favoritos/i })
        );

        expect(screen.queryByText(teacher.name)).not.toBeInTheDocument();
    });

    it('renders the favorite synchronously, before the backfill fetch resolves', () => {
        const fetchMock = vi.fn(() => new Promise(() => {}));
        vi.stubGlobal('fetch', fetchMock);

        render(<Favorites />);

        expect(screen.getByText(teacher.name)).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining(`/classes/schedule?user_id=${teacher.id}`)
        );

        vi.unstubAllGlobals();
    });

    it('backfills schedule for an old favorite and persists it to localStorage', async () => {
        const schedule = [{ week_day: 1, from: '08:00', to: '12:00' }];
        const fetchMock = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(schedule),
            })
        );
        vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

        render(<Favorites />);

        await screen.findByText(/08:00 às 12:00/i);

        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
        expect(stored[0].schedule).toEqual(schedule);

        vi.unstubAllGlobals();
    });

    it('keeps rendering the card when the backfill fetch fails', async () => {
        const fetchMock = vi.fn(() => Promise.resolve({ ok: false }));
        vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

        render(<Favorites />);

        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());

        expect(screen.getByText(teacher.name)).toBeInTheDocument();

        vi.unstubAllGlobals();
    });
});
