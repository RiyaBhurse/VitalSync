import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const MedicineScreen = () => {
    const [medicines, setMedicines] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [instructions, setInstructions] = useState('');
    const [schedules, setSchedules] = useState([{ date: getTodayDate(), time: '08:00' }]);

    function getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    const fetchMedicines = async () => {
        try { const res = await api.get('/medicines'); setMedicines(res.data); }
        catch (err) { Alert.alert('Error', 'Failed to fetch medicines'); }
    };

    useFocusEffect(useCallback(() => { fetchMedicines(); }, []));

    const handleAddMedicine = async () => {
        if (!name || !dosage) { Alert.alert('Error', 'Name and Dosage required'); return; }

        // Validate schedules
        const validSchedules = schedules.filter(s => {
            const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(s.date);
            const timeValid = /^\d{2}:\d{2}$/.test(s.time);
            return dateValid && timeValid;
        });

        if (validSchedules.length === 0) {
            Alert.alert('Error', 'At least one valid schedule (YYYY-MM-DD, HH:mm) required');
            return;
        }

        // Extract times for backward compatibility
        const times = validSchedules.map(s => s.time);
        // Also send full schedule data
        const scheduleDates = validSchedules.map(s => ({ date: s.date, time: s.time }));

        try {
            await api.post('/medicines', { name, dosage, instructions, times, scheduleDates });
            setModalVisible(false);
            resetForm();
            fetchMedicines();
        } catch (err) { Alert.alert('Error', 'Failed to add medicine'); }
    };

    const handleDelete = (id) => Alert.alert('Delete Medicine', 'Are you sure?', [
        { text: 'Cancel' },
        {
            text: 'Delete', style: 'destructive', onPress: async () => {
                try { await api.delete(`/medicines/${id}`); fetchMedicines(); }
                catch (err) { Alert.alert('Error', 'Failed to delete'); }
            }
        }
    ]);

    const resetForm = () => {
        setName('');
        setDosage('');
        setInstructions('');
        setSchedules([{ date: getTodayDate(), time: '08:00' }]);
    };

    const addScheduleSlot = () => setSchedules([...schedules, { date: getTodayDate(), time: '' }]);

    const updateSchedule = (index, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[index][field] = value;
        setSchedules(newSchedules);
    };

    const removeScheduleSlot = (index) => setSchedules(schedules.filter((_, i) => i !== index));

    const handleGenerateInvite = async () => {
        try {
            const res = await api.post('/users/invite-code');
            Alert.alert('Invite Code', `Share with caretaker:\n\n${res.data.inviteCode}`);
        } catch (err) { Alert.alert('Error', 'Failed to generate invite'); }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{item.name} <Text style={styles.dosageText}>({item.dosage})</Text></Text>
                <Text style={styles.details}>Times: {item.times?.join(', ') || 'No times set'}</Text>
                {item.instructions && <Text style={styles.details}>{item.instructions}</Text>}
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                <Icon name="trash-outline" size={20} color="#dc3545" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>My Medicines</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                    <Icon name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleGenerateInvite} style={styles.inviteLink}>
                <Text style={styles.inviteText}>Generate Caretaker Invite Code</Text>
            </TouchableOpacity>

            <FlatList
                data={medicines}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No medicines added yet.</Text>}
            />

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Medicine</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.form}>
                        <Text style={styles.label}>Medicine Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Aspirin"
                        />

                        <Text style={styles.label}>Dosage *</Text>
                        <TextInput
                            style={styles.input}
                            value={dosage}
                            onChangeText={setDosage}
                            placeholder="e.g. 100mg"
                        />

                        <Text style={styles.label}>Instructions (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={instructions}
                            onChangeText={setInstructions}
                            placeholder="e.g. Take after food"
                        />

                        <Text style={styles.label}>Schedule (Date & Time) *</Text>
                        <Text style={styles.hintText}>Format: Date (YYYY-MM-DD), Time (HH:mm)</Text>

                        {schedules.map((schedule, index) => (
                            <View key={index} style={styles.scheduleRow}>
                                <View style={styles.scheduleInputs}>
                                    <TextInput
                                        style={[styles.input, styles.dateInput]}
                                        value={schedule.date}
                                        onChangeText={(text) => updateSchedule(index, 'date', text)}
                                        placeholder="2026-01-20"
                                        keyboardType="numbers-and-punctuation"
                                    />
                                    <TextInput
                                        style={[styles.input, styles.timeInput]}
                                        value={schedule.time}
                                        onChangeText={(text) => updateSchedule(index, 'time', text)}
                                        placeholder="08:00"
                                        keyboardType="numbers-and-punctuation"
                                    />
                                </View>
                                {schedules.length > 1 && (
                                    <TouchableOpacity onPress={() => removeScheduleSlot(index)} style={styles.removeBtn}>
                                        <Icon name="remove-circle" size={28} color="#dc3545" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity onPress={addScheduleSlot} style={styles.addScheduleBtn}>
                            <Icon name="add-circle-outline" size={20} color="#007BFF" />
                            <Text style={styles.addScheduleText}>Add Another Schedule</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.submitBtn} onPress={handleAddMedicine}>
                            <Text style={styles.submitText}>Save Medicine</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold' },
    addBtn: { backgroundColor: '#007BFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    inviteLink: { padding: 12, backgroundColor: '#e2e6ea', alignItems: 'center' },
    inviteText: { color: '#007BFF', fontWeight: 'bold' },
    list: { padding: 15 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', elevation: 2 },
    medName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    dosageText: { fontWeight: 'normal', color: '#666' },
    details: { color: '#888', marginTop: 4 },
    deleteBtn: { padding: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    closeText: { color: '#007BFF', fontSize: 16 },
    form: { padding: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    hintText: { fontSize: 12, color: '#888', marginBottom: 10 },
    input: { backgroundColor: '#f9f9f9', padding: 14, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
    scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    scheduleInputs: { flex: 1, flexDirection: 'row', gap: 10 },
    dateInput: { flex: 1.2, marginBottom: 0 },
    timeInput: { flex: 0.8, marginBottom: 0 },
    removeBtn: { marginLeft: 10, padding: 5 },
    addScheduleBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    addScheduleText: { color: '#007BFF', fontWeight: 'bold', marginLeft: 5 },
    submitBtn: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default MedicineScreen;
