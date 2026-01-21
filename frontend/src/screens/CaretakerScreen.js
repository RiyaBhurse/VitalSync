import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons as Icon } from '@expo/vector-icons';

const CaretakerScreen = () => {
    const { logout } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => { try { const res = await api.get('/caretaker/stats'); setStats(res.data); } catch (err) { } finally { setRefreshing(false); } };

    useFocusEffect(useCallback(() => { fetchStats(); }, []));
    const onRefresh = useCallback(() => { setRefreshing(true); fetchStats(); }, []);
    const handleLogout = () => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }]);

    if (!stats) return <SafeAreaView style={styles.container}><Text style={styles.emptyText}>Loading data...</Text></SafeAreaView>;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}><Text style={styles.headerTitle}>Caretaker Dashboard</Text><TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}><Icon name="log-out-outline" size={24} color="#dc3545" /></TouchableOpacity></View>
            <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={styles.card}><Text style={styles.label}>Today's Adherence</Text><Text style={[styles.adherenceValue, { color: stats.todayAdherence >= 80 ? '#28a745' : '#ffc107' }]}>{stats.todayAdherence}%</Text></View>
                <Text style={styles.sectionTitle}>Today's Activity</Text>
                {stats.todayLogs?.length > 0 ? stats.todayLogs.map(log => (
                    <View key={log._id} style={styles.logCard}>
                        <View style={styles.timeBadge}><Text style={styles.timeText}>{log.scheduledTime}</Text></View>
                        <View style={{ flex: 1 }}><Text style={styles.medName}>{log.referenceId?.name || 'Unknown'}</Text><Text style={styles.medDose}>{log.referenceId?.dosage || ''}</Text></View>
                        <View style={[styles.statusPill, log.status === 'TAKEN' ? styles.takenPill : log.status === 'SKIPPED' ? styles.skippedPill : styles.pendingPill]}>
                            <Text style={[styles.statusText, log.status === 'TAKEN' ? styles.takenText : log.status === 'SKIPPED' ? styles.skippedText : styles.pendingText]}>{log.status}</Text>
                        </View>
                    </View>
                )) : <View style={styles.emptyContainer}><Icon name="calendar-outline" size={50} color="#ccc" /><Text style={styles.emptyText}>No activity recorded.</Text></View>}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 4 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
    logoutBtn: { padding: 8, borderRadius: 20, backgroundColor: '#fff0f0' },
    content: { padding: 20 },
    card: { backgroundColor: '#fff', padding: 25, borderRadius: 16, marginBottom: 20, alignItems: 'center', elevation: 2 },
    label: { fontSize: 14, color: '#6c757d', marginBottom: 8, textTransform: 'uppercase', fontWeight: '500' },
    adherenceValue: { fontSize: 48, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1a1a2e' },
    logCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 1 },
    timeBadge: { backgroundColor: '#e9ecef', padding: 10, borderRadius: 8, marginRight: 15 },
    timeText: { fontWeight: 'bold', color: '#495057', fontSize: 14 },
    medName: { fontSize: 16, fontWeight: '600', color: '#212529' },
    medDose: { fontSize: 14, color: '#868e96', marginTop: 2 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    takenPill: { backgroundColor: '#d4edda' }, skippedPill: { backgroundColor: '#f8d7da' }, pendingPill: { backgroundColor: '#fff3cd' },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    takenText: { color: '#155724' }, skippedText: { color: '#721c24' }, pendingText: { color: '#856404' },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { textAlign: 'center', color: '#6c757d', marginTop: 15, fontSize: 16 },
});

export default CaretakerScreen;
