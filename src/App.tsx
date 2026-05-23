import { useEffect } from 'react';
import { useApp } from './lib/store';
import { audio } from './lib/audio';
import { PortraitWarn } from './components/PortraitWarn';
import { Loading } from './components/Loading';
import { MainMenu } from './components/MainMenu';
import { ClassSelect } from './components/ClassSelect';
import { Settings } from './components/Settings';
import { CharacterViewer } from './components/CharacterViewer';
import { GameOver } from './components/GameOver';
import { HUD } from './components/HUD';
import { Game } from './game/Game';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const screen = useApp((s) => s.screen);
  const sfx = useApp((s) => s.settings.sfx);

  useEffect(() => {
    audio.setEnabled(sfx);
  }, [sfx]);

  return (
    <ErrorBoundary>
      <div className="app-root">
        <PortraitWarn />
        {screen === 'loading' && <Loading />}
        {screen === 'menu' && <MainMenu />}
        {screen === 'class' && <ClassSelect />}
        {screen === 'settings' && <Settings />}
        {screen === 'viewer' && <CharacterViewer />}
        {screen === 'game' && (
          <div className="screen game-screen">
            <Game />
            <HUD />
          </div>
        )}
        {screen === 'gameover' && <GameOver victory={false} />}
        {screen === 'victory' && <GameOver victory={true} />}
      </div>
    </ErrorBoundary>
  );
}
