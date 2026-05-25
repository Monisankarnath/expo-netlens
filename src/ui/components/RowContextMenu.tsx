import { useCallback } from 'react';
import { Platform, ActionSheetIOS, Alert } from 'react-native';

export interface ContextMenuAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export function useContextMenu(actions: ContextMenuAction[]) {
  const showMenu = useCallback(() => {
    if (Platform.OS === 'ios') {
      const labels = actions.map(a => a.label);
      labels.push('Cancel');
      const destructiveIndex = actions.findIndex(a => a.destructive);

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: labels,
          cancelButtonIndex: labels.length - 1,
          destructiveButtonIndex: destructiveIndex >= 0 ? destructiveIndex : undefined,
        },
        (index) => {
          if (index < actions.length) {
            actions[index].onPress();
          }
        }
      );
    } else {
      // Android / Web: use Alert
      Alert.alert(
        'Actions',
        undefined,
        [
          ...actions.map(a => ({
            text: a.label,
            onPress: a.onPress,
            style: (a.destructive ? 'destructive' : 'default') as any,
          })),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  }, [actions]);

  return showMenu;
}
