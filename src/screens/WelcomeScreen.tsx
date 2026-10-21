import { useNavigate } from 'react-router';
import { LaunchScreen } from '../components/LaunchScreen';

/** /welcome shows the launch screen on demand, then continues to Home. */
export function WelcomeScreen() {
  const navigate = useNavigate();
  return <LaunchScreen onDone={() => navigate('/', { replace: true })} />;
}
