import { Users } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { usePlayers } from '../data/DataProvider';
import styles from './FriendsScreen.module.css';

/** Accepted friends only. There's deliberately no search or discovery of other users. */
export function FriendsScreen() {
  const players = usePlayers();
  let body;
  if (players.status === 'loading') body = <LoadingState label="Loading friends" rows={4} />;
  else if (players.status === 'error') body = <ErrorState error={players.error} onRetry={players.retry} />;
  else if (players.data.friends.length === 0)
    body = <EmptyState art={<Users size={44} aria-hidden="true" />} title="No Friends Yet" body="Friends you accept will show up here." />;
  else
    body = (
      <>
        <ul className={`list-reset ${styles.list}`}>
          {players.data.friends.map((f) => (
            <li key={f.id} className={styles.friend}>
              <Avatar player={f} size={44} />
              <span className={styles.text}>
                <strong>{f.username}</strong>
                {f.handle && <span>@{f.handle}</span>}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>Seshy is friends-only: there’s no public search, and adding friends by invite comes in a later phase.</p>
      </>
    );

  return (
    <>
      <ScreenHeader title="Friends" backTo="/profile" backLabel="Back to profile" />
      {body}
    </>
  );
}
