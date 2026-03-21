import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.size-sm]': 'size() === "sm"',
    '[class.size-md]': 'size() === "md"',
    '[class.size-lg]': 'size() === "lg"',
  },
})
export class Avatar {
  /** User's full name (used for initials fallback) */
  name = input<string | null>(null);

  /** Avatar image URL (social login photo) */
  avatarUrl = input<string | null>(null);

  /** Size variant */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Computed initials from the user's name */
  readonly initials = computed(() => this.getInitials(this.name()));

  /** Whether to show avatar image or initials */
  readonly hasImage = computed(() => !!this.avatarUrl());

  /**
   * Generates initials from a user's name.
   *
   * Rules:
   * - Two or more names → first letter of first + first letter of last
   * - Single name → first two letters
   * - Always uppercase
   */
  private getInitials(name: string | null): string {
    if (!name || name.trim().length === 0) return '?';

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return parts[0].substring(0, 2).toUpperCase();
  }
}
