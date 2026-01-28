import type { SVGProps } from 'react';
import Image from 'next/image';

export function AppLogo(props: { className?: string }) {
    return (
        <>
            {/* Mobile Logo */}
            <Image
                src="https://blogger.googleusercontent.com/img/a/AVvXsEg8Du_3e80ZnepBZ8T8nm_vdjH3ZynAhZwrMbnM0kaCFlzYKn4uGwes1KBJKxgeSRY571mHDCiid4ggn3osXPWQlOpoQnN_5B81nsw-X8T1V894zr2PZ30XPLyZlN6nkqKpMYLGVbcQzFcP3JtHy9Am9BhfKp-xdNaK4kJejad3WtnPBy2LiDBanr9x3guV"
                alt="Quick Phone Fix N More Logo"
                width={140}
                height={42}
                className={`sm:hidden ${props.className || ''}`}
            />
            {/* Desktop Logo */}
            <Image
                src="https://blogger.googleusercontent.com/img/a/AVvXsEg8Du_3e80ZnepBZ8T8nm_vdjH3ZynAhZwrMbnM0kaCFlzYKn4uGwes1KBJKxgeSRY571mHDCiid4ggn3osXPWQlOpoQnN_5B81nsw-X8T1V894zr2PZ30XPLyZlN6nkqKpMYLGVbcQzFcP3JtHy9Am9BhfKp-xdNaK4kJejad3WtnPBy2LiDBanr9x3guV"
                alt="Quick Phone Fix N More Logo"
                width={250}
                height={75}
                className={`hidden sm:block ${props.className || ''}`}
            />
        </>
    );
}
