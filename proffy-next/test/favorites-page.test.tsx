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
});
