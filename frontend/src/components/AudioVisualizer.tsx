import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording }) => {
  const anims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.7),
    new Animated.Value(1.0),
    new Animated.Value(0.5),
    new Animated.Value(0.8),
    new Animated.Value(0.4),
    new Animated.Value(0.9),
  ]).current;

  useEffect(() => {
    if (isRecording) {
      const loops = anims.map((anim, idx) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.2 + ((idx * 37) % 80) / 100,
              duration: 250 + (idx % 3) * 100,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.9 - ((idx * 23) % 40) / 100,
              duration: 250 + (idx % 3) * 100,
              useNativeDriver: false,
            }),
          ])
        )
      );
      loops.forEach((l) => l.start());
      return () => loops.forEach((l) => l.stop());
    } else {
      anims.forEach((anim) => anim.setValue(0.2));
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {anims.map((anim, idx) => {
        const heightInterpolate = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 42],
        });

        return (
          <Animated.View
            key={idx}
            style={[
              styles.waveformBar,
              {
                height: heightInterpolate,
                backgroundColor: isRecording ? colors.accent : colors.textMuted,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 6,
    paddingHorizontal: 20,
  },
  waveformBar: {
    width: 4,
    borderRadius: 3,
  },
});
