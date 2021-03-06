import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Animated,
  StyleSheet,
  View,
  AppStateStatus,
} from 'react-native';

import { PreventScreenshots } from '../prevent-screenshots';

export function withPreventScreenshots<P = {}>(App: React.FC<P>): React.FC<P> {
  return (props) => {
    const [showOverlay, setShowOverlay] = useState(false);

    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(opacity, {
        toValue: showOverlay ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, [showOverlay, opacity]);

    const handleStateChange = useCallback(async (status: AppStateStatus) => {
      const isPrevented = await PreventScreenshots.isPrevented();
      if (isPrevented) {
        return setShowOverlay(status !== 'active');
      }

      if (!showOverlay) {
        setShowOverlay(false);
      }
    }, []);

    useEffect(() => {
      const subscription = AppState.addEventListener(
        'change',
        handleStateChange
      );

      return () => {
        if (typeof subscription?.remove === 'function') {
          subscription.remove();
        } else {
          AppState.removeEventListener('change', handleStateChange);
        }
      };
    }, []);

    return (
      <View style={styles.container}>
        <App {...props} />
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.overlay, { opacity }]}
          pointerEvents={showOverlay ? 'auto' : 'none'}
        />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    backgroundColor: 'black',
  },
});
