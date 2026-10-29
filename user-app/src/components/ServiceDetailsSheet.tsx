import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Field, formatMoney } from './UI';
import { colors } from '../theme';
import type { ServiceRequirements } from '../types';
import { cleanRequirements, fixedQuantity, getServiceProfile, pricingUnit, quantityLabel, requirementEntries, type ServiceOption } from '../utils/serviceRequirements';

export function ServiceRequirementsView({ requirements }: { requirements?: ServiceRequirements }) {
  const entries = requirementEntries(requirements);
  if (!entries.length) return null;
  return <View style={styles.summary}>{entries.map(item => <Text key={item.key} style={styles.summaryText}>{item.label}: {item.value}</Text>)}</View>;
}

export function ServiceDetailsSheet({ option, vendorName, vendorType, occasion, guests, quantity, requirements, selected, replacesSelection, onClose, onSave, onRemove }: {
  option: ServiceOption; vendorName: string; vendorType: string; occasion: string; guests: number;
  quantity: string; requirements?: ServiceRequirements; selected: boolean; replacesSelection: boolean;
  onClose: () => void; onSave: (quantity: string, requirements: ServiceRequirements) => void; onRemove: () => void;
}) {
  const [draftQuantity, setDraftQuantity] = useState(fixedQuantity(option.pricingType) ? '1' : quantity);
  const [draft, setDraft] = useState<ServiceRequirements>(requirements || {});
  const [error, setError] = useState('');
  const profile = getServiceProfile(option, vendorType, occasion);
  const amount = Number(draftQuantity);
  const validQuantity = Number.isInteger(amount) && amount >= 1 && amount <= 100000;
  function save() {
    if (!validQuantity) return setError('Enter a whole-number quantity between 1 and 100000.');
    const values = cleanRequirements(draft);
    if (values.start && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(values.start)) return setError('Enter the requested time as HH:mm, for example 18:00.');
    onSave(draftQuantity, values);
  }
  return <Modal visible animationType="slide" transparent onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.header}><Text style={styles.headerTitle}>Service details</Text><Pressable accessibilityRole="button" accessibilityLabel="Close service details" onPress={onClose} style={styles.close}><Ionicons name="close" size={23} color={colors.slate} /></Pressable></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.muted}>{vendorName}</Text><Text style={styles.title}>{option.name}</Text>
          <Text style={styles.muted}>{option.description || 'Detailed inclusions have not been provided. Confirm the scope with this vendor.'}</Text>
          <View style={styles.context}><Text style={styles.contextTitle}>{occasion || 'Your service request'}{guests > 0 ? ` · ${guests} guests` : ''}</Text><Text style={styles.muted}>{profile.hint}</Text></View>
          <View style={styles.rate}><Text style={styles.label}>Service rate</Text><Text style={styles.price}>{formatMoney(option.price)} <Text style={styles.muted}>{pricingUnit(option.pricingType)}</Text></Text></View>
          {fixedQuantity(option.pricingType) ? <Text style={styles.muted}>Quantity: 1 · {option.artist ? 'one performance' : 'fixed service'}</Text> : <Field label={quantityLabel(option.pricingType)} accessibilityLabel={`${option.name} detail quantity`} value={draftQuantity} onChangeText={value => { setDraftQuantity(value); setError(''); }} keyboardType="number-pad" maxLength={6} />}
          <Text style={styles.section}>Your preferences <Text style={styles.muted}>(optional)</Text></Text>
          {profile.fields.map(field => <View key={field.key} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            {field.options ? <View style={styles.options}>{field.options.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={`${field.label}: ${value}`} accessibilityState={{ selected: draft[field.key] === value }} onPress={() => { setDraft(current => ({ ...current, [field.key]: current[field.key] === value ? '' : value })); setError(''); }} style={[styles.chip, draft[field.key] === value && styles.chipActive]}><Text style={[styles.chipText, draft[field.key] === value && styles.chipTextActive]}>{value}</Text></Pressable>)}</View> : <TextInput accessibilityLabel={field.label} value={draft[field.key] || ''} onChangeText={value => { setDraft(current => ({ ...current, [field.key]: value })); setError(''); }} maxLength={field.time ? 5 : 500} placeholder={field.placeholder} placeholderTextColor={colors.muted} multiline={field.multiline} style={[styles.input, field.multiline && styles.multiline]} />}
          </View>)}
          <Text style={styles.note}>Preferences are requests. Availability, final inclusions and any extra charges need vendor confirmation.</Text>
          {replacesSelection && !selected ? <Text style={styles.note}>One-service mode: adding this replaces your current selection.</Text> : null}
          {selected ? <Pressable accessibilityRole="button" onPress={onRemove} style={styles.remove}><Text style={styles.removeText}>Remove from selection</Text></Pressable> : null}
        </ScrollView>
        <View style={styles.footer}>{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<View style={styles.totalRow}><Text style={styles.muted}>This service estimate</Text><Text style={styles.total}>{validQuantity ? formatMoney(option.price * amount) : 'Check quantity'}</Text></View><Button label={selected ? 'Save service details' : 'Add service'} onPress={save} disabled={!option.available} /></View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(30,10,18,0.45)' }, sheet: { maxHeight: '92%', backgroundColor: colors.soft, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: colors.border }, headerTitle: { fontSize: 14, fontWeight: '700', color: colors.slate }, close: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 24 }, title: { fontSize: 21, fontWeight: '700', color: colors.slate, marginVertical: 10 }, muted: { color: colors.muted, fontSize: 12, lineHeight: 18 }, context: { backgroundColor: colors.paleIndigo, padding: 12, borderRadius: 12, marginVertical: 16 }, contextTitle: { fontSize: 13, color: colors.slate, fontWeight: '600', marginBottom: 5 },
  rate: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }, price: { fontSize: 15, fontWeight: '700', color: colors.slate }, section: { fontSize: 16, fontWeight: '700', color: colors.slate, marginTop: 18, marginBottom: 16 }, label: { fontSize: 12, fontWeight: '600', color: colors.slate, marginBottom: 8 },
  field: { marginBottom: 16 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { paddingHorizontal: 11, paddingVertical: 11, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white }, chipActive: { backgroundColor: colors.indigo, borderColor: colors.indigo }, chipText: { fontSize: 12, color: colors.slate }, chipTextActive: { color: colors.white },
  input: { minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 12, color: colors.slate, fontSize: 13 }, multiline: { minHeight: 85, textAlignVertical: 'top' }, note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginVertical: 10 }, remove: { paddingVertical: 14 }, removeText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  footer: { padding: 16, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.white }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }, total: { color: colors.slate, fontSize: 20, fontWeight: '700' }, error: { color: colors.danger, fontSize: 12, marginBottom: 10 }, summary: { marginTop: 8, gap: 3 }, summaryText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
