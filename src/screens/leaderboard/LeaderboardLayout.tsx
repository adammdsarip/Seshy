import { Outlet } from 'react-router';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CrownSticker } from '../../components/Stickers';
import { RouteTabs } from '../../components/Tabs';

export function LeaderboardLayout() {
  return (
    <>
      <ScreenHeader
        backTo="/play"
        backLabel="Back to Play"
        title={
          <>
            Leaderboard <CrownSticker size={30} />
          </>
        }
      />
      <RouteTabs
        label="Leaderboard views"
        tabs={[
          { to: '/play/leaderboard/current', label: 'Current Match' },
          { to: '/play/leaderboard/friends', label: 'Friends Ranking' },
        ]}
      />
      <Outlet />
    </>
  );
}
