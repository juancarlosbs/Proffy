import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

vi.mock('next/image', () => ({
    default: (props: React.ComponentProps<'img'>) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

import Favorites from '@/app/favorites/page';
import { addFavorite } from '@/utils/favorites';
import type { Teacher } from '@/components/TeacherItem';

const teacher: Teacher = {
    id: 1,
    avatar: 'https://example.com/avatar.png',
    bio: 'Computer scientist',
    cost: 50,
    name: 'Alan Turing',
    subject: 'Computer Science',
    whatsapp: '11999999999',
};

afterEach(() => {
    cleanup();
    window.localStorage.clear();
});

beforeEach(() => {
    addFavorite(teacher);
});

describe('Favorites page', () => {
    it('removes a teacher card immediately after it is unfavorited', async () => {
        const user = userEvent.setup();
        render(<Favorites />);

        expect(screen.getByText(teacher.name)).toBeInTheDocument();

        const unfavoriteButton = screen.getByRole('button', {
            name: 'Remover dos favoritos',
        });
        await user.click(unfavoriteButton);

        expect(screen.queryByText(teacher.name)).not.toBeInTheDocument();
        expect(
            screen.getByText('Você ainda não favoritou nenhum proffy.'),
        ).toBeInTheDocument();
    });
});
