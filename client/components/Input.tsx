/**
 * Input — Themed text input for CoachME
 *
 * Features: label, left icon, focus/error borders,
 * secure-text eye toggle, multiline support.
 */

import React, { ReactNode, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing, radius } from '../constants/spacing';

export interface InputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: ReactNode;
  editable?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType,
  error,
  multiline = false,
  autoCapitalize,
  icon,
  editable = true,
}) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  // Determine border color based on state priority: error > focus > default
  const borderColor = error
    ? theme.status.error
    : focused
      ? theme.accent.purple
      : theme.border.subtle;

  return (
    <View style={styles.wrapper}>
      {/* ── Label ─────────────────────────────────────── */}
      <Text style={styles.label}>{label}</Text>

      {/* ── Input container ───────────────────────────── */}
      <View
        style={[
          styles.container,
          { borderColor },
          multiline && styles.multiline,
        ]}
      >
        {/* Optional left icon */}
        {icon && <View style={styles.iconLeft}>{icon}</View>}

        <TextInput
          style={[
            styles.input,
            icon ? { paddingLeft: 44 } : undefined,
            secureTextEntry ? { paddingRight: 44 } : undefined,
            multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.text.muted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {/* Secure-text toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setHidden((h) => !h)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {hidden ? (
              <EyeOff size={18} color={theme.text.muted} />
            ) : (
              <Eye size={18} color={theme.text.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Error message ─────────────────────────────── */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: theme.text.secondary,
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bg.input,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 52,
  },
  multiline: {
    height: undefined,
    minHeight: 100,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: theme.text.primary,
    paddingHorizontal: spacing.lg,
    height: '100%',
  },
  multilineInput: {
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  iconLeft: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
  },
  error: {
    ...typography.caption,
    color: theme.status.error,
    marginTop: spacing.xs,
  },
});

export default Input;
