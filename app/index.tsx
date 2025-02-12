import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const TIME_OPTIONS = [1, 3, 5, 10];
const CHESS_BOARD_BG = "https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=2958&auto=format&fit=crop";

export default function ChessTimer() {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [player1Time, setPlayer1Time] = useState<number>(0);
  const [player2Time, setPlayer2Time] = useState<number>(0);
  const [activePlayer, setActivePlayer] = useState<number | null>(null);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound>();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const playTimeUpSound = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/timeup.mp3')
        );
        setSound(sound);
        await sound.playAsync();
      } else {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        for (let i = 0; i < 3; i++) {
          const oscillator = audioContext.createOscillator();
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime + i * 0.3);
          oscillator.connect(audioContext.destination);
          oscillator.start(audioContext.currentTime + i * 0.3);
          oscillator.stop(audioContext.currentTime + i * 0.3 + 0.2);
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activePlayer) {
      interval = setInterval(() => {
        if (activePlayer === 1) {
          setPlayer1Time((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setActivePlayer(null);
              playTimeUpSound();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setPlayer2Time((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setActivePlayer(null);
              playTimeUpSound();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activePlayer]);

  const startGame = (minutes: number) => {
    setSelectedTime(minutes);
    setPlayer1Time(minutes * 60);
    setPlayer2Time(minutes * 60);
    setActivePlayer(null);
    setHasGameStarted(false);
  };

  const togglePlayer = (playerNum: number) => {
    if (activePlayer === playerNum) {
      setActivePlayer(playerNum === 1 ? 2 : 1);
    }
  };

  const startWhiteTimer = () => {
    setActivePlayer(1);
    setHasGameStarted(true);
  };

  const resetGame = () => {
    setSelectedTime(null);
    setPlayer1Time(0);
    setPlayer2Time(0);
    setActivePlayer(null);
    setHasGameStarted(false);
  };

  if (!selectedTime) {
    return (
      <ImageBackground source={{ uri: CHESS_BOARD_BG }} style={styles.container} resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.title}>Chess Timer</Text>
          <View style={styles.timeSelection}>
            {TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time}
                style={styles.timeOption}
                onPress={() => startGame(time)}
              >
                <Text style={styles.timeOptionText}>{time} min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={{ uri: CHESS_BOARD_BG }} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[
            styles.playerSection,
            styles.player2Section,
            activePlayer === 2 && styles.activePlayer,
          ]}
          onPress={() => togglePlayer(2)}
        >
          <View style={styles.playerContent}>
            <Text style={[styles.playerLabel]}>Negras</Text>
            <Text style={[styles.timer, activePlayer === 2 && styles.activeTimer]}>
              {formatTime(player2Time)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.controls}>
          {!activePlayer && !hasGameStarted && (
            <TouchableOpacity 
              style={styles.startButton}
              onPress={startWhiteTimer}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.startText}>Iniciar Partida</Text>
            </TouchableOpacity>
          )}
          {hasGameStarted && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetGame}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.playerSection,
            styles.player1Section,
            { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
            activePlayer === 1 && styles.activePlayer,
          ]}
          onPress={() => togglePlayer(1)}
        >
          <View style={styles.playerContent}>
            <Text style={[styles.playerLabel, styles.whitePlayerLabel]}>Blancas</Text>
            <Text style={[styles.timer, styles.whitePlayerTimer, activePlayer === 1 && styles.activeTimer]}>
              {formatTime(player1Time)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 40,
  },
  timeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },
  timeOption: {
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    padding: 20,
    borderRadius: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeOptionText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  playerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    position: 'relative',
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  player1Section: {
    transform: [{ rotate: '180deg' }],
  },
  player2Section: {},
  activePlayer: {
    backgroundColor: 'rgba(44, 82, 130, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    transform: [{ rotate: '180deg' }],
    color: '#fff',
  },
  whitePlayerTimer: {
    color: '#333',
  },
  activeTimer: {
    color: '#fff',
  },
  playerLabel: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '500',
    transform: [{ rotate: '180deg' }],
    marginBottom: 8,
  },
  whitePlayerLabel: {
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 133, 90, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  startText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(185, 28, 28, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});