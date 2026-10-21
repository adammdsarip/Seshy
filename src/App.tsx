import { Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/AppShell';
import { HomeScreen } from './screens/HomeScreen';
import { MatchDetailsScreen } from './screens/MatchDetailsScreen';
import { MatchHistoryScreen } from './screens/MatchHistoryScreen';
import { NotFoundScreen, SessionsScreen, TrickbookScreen } from './screens/PlaceholderScreens';
import { PlayScreen } from './screens/PlayScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { StartMatchScreen } from './screens/StartMatchScreen';
import { FriendsScreen } from './screens/FriendsScreen';
import { CurrentMatchScreen } from './screens/leaderboard/CurrentMatchScreen';
import { FriendsRankingScreen } from './screens/leaderboard/FriendsRankingScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeScreen />} />
        <Route path="trickbook" element={<TrickbookScreen />} />
        <Route path="play">
          <Route index element={<PlayScreen />} />
          <Route path="start" element={<StartMatchScreen />} />
          <Route path="leaderboard">
            <Route index element={<Navigate to="friends" replace />} />
            <Route path="current" element={<CurrentMatchScreen />} />
            <Route path="friends" element={<FriendsRankingScreen />} />
          </Route>
          <Route path="history" element={<MatchHistoryScreen />} />
          <Route path="matches/:matchId" element={<MatchDetailsScreen />} />
        </Route>
        <Route path="sessions" element={<SessionsScreen />} />
        <Route path="profile">
          <Route index element={<ProfileScreen />} />
          <Route path="friends" element={<FriendsScreen />} />
        </Route>
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
      <Route path="welcome" element={<WelcomeScreen />} />
    </Routes>
  );
}
