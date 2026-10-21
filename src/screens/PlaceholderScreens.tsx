import { House } from 'lucide-react';
import { ButtonLink } from '../components/Button';
import { ComingSoon } from '../components/ComingSoon';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState } from '../components/States';
import { DiceIcon } from '../components/BrandIcons';

export function TrickbookScreen() {
  return (
    <>
      <ScreenHeader title="Trickbook" />
      <ComingSoon
        title="Your Trickbook"
        planned={[
          'Log the tricks you can land, and the ones you’re working on',
          'Track progress per trick over time',
          'Feed your trick list into Skate Dice rolls',
        ]}
      >
        Trickbook isn’t built yet. It’s where you’ll track every trick you’ve learned and the ones you’re chasing.
      </ComingSoon>
    </>
  );
}

export function SessionsScreen() {
  return (
    <>
      <ScreenHeader title="Sessions" />
      <ComingSoon
        title="Your Sessions"
        planned={[
          'Plan a session: spot, time and who’s coming',
          'See upcoming and past sessions',
          'Link the games and tricks from each session',
        ]}
      >
        Sessions aren’t built yet. They’ll pull together where you skated, who with, and what went down.
      </ComingSoon>
    </>
  );
}

export function NotFoundScreen() {
  return (
    <>
      <ScreenHeader title="Not Found" />
      <EmptyState
        art={<DiceIcon size={44} />}
        title="Page Not Found"
        body="That page doesn’t exist. Let’s get you back to the session."
        action={
          <ButtonLink to="/" icon={<House size={18} aria-hidden="true" />}>
            Go Home
          </ButtonLink>
        }
      />
    </>
  );
}
