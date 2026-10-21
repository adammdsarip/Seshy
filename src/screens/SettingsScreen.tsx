import { Bell, CircleHelp, Globe, Info, Moon, Shield, UserPen } from 'lucide-react';
import { ListGroup, ListRow } from '../components/ListRow';
import { ScreenHeader } from '../components/ScreenHeader';

/**
 * Only About is live. Appearance and Language are fixed for now and say so;
 * everything else is marked as coming soon rather than pretending to work.
 */
export function SettingsScreen() {
  return (
    <>
      <ScreenHeader title="Settings" backTo="/profile" backLabel="Back to profile" />
      <div className="stack-lg">
        <ListGroup title="Account">
          <ListRow icon={<UserPen size={20} aria-hidden="true" />} label="Edit Profile" soon />
          <ListRow icon={<Bell size={20} aria-hidden="true" />} label="Notifications" soon />
          <ListRow icon={<Shield size={20} aria-hidden="true" />} label="Privacy" soon />
        </ListGroup>
        <ListGroup title="App">
          <ListRow icon={<Moon size={20} aria-hidden="true" />} label="Appearance" value="Dark" />
          <ListRow icon={<Globe size={20} aria-hidden="true" />} label="Language" value="English" />
          <ListRow icon={<Info size={20} aria-hidden="true" />} label="About Seshy" value={`v${__APP_VERSION__}`} />
          <ListRow icon={<CircleHelp size={20} aria-hidden="true" />} label="Help & Support" soon />
        </ListGroup>
      </div>
    </>
  );
}
