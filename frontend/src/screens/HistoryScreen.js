import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const HistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ taken: 0, skipped: 0, total: 0 });

    const fetchHistory = async () => {
        try {
            const res = await api.get('/events/history');
            setHistory(res.data);
            const taken = res.data.filter(l => l.status === 'TAKEN').length;
            const skipped = res.data.filter(l => l.status === 'SKIPPED').length;
            setStats({ taken, skipped, total: res.data.length });
        } catch (err) { Alert.alert('Error', 'Failed to fetch history'); }
    };

    useFocusEffect(useCallback(() => { fetchHistory(); }, []));

    const adherencePercent = stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0;

    const renderItem = ({ item }) => {
        let iconName = 'time', color = '#ffc107';
        if (item.status === 'TAKEN') { iconName = 'checkmark-circle'; color = '#28a745'; }
        else if (item.status === 'SKIPPED') { iconName = 'close-circle'; color = '#dc3545'; }
        return (
            <View style={styles.card}>
                <Icon name={iconName} size={28} color={color} style={{ marginRight: 15 }} />
                <View style={{ flex: 1 }}><Text style={styles.date}>{item.dateString}</Text><Text style={styles.time}>{item.scheduledTime}</Text></View>
                <View style={[styles.statusPill, { backgroundColor: color + '20' }]}><Text style={[styles.statusText, { color }]}>{item.status}</Text></View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}><Text style={styles.title}>Adherence History</Text></View>
            <View style={styles.statsContainer}>
                <View style={styles.statCard}><Text style={styles.statNumber}>{adherencePercent}%</Text><Text style={styles.statLabel}>Adherence</Text></View>
                <View style={[styles.statCard, { backgroundColor: '#d4edda' }]}><Text style={[styles.statNumber, { color: '#28a745' }]}>{stats.taken}</Text><Text style={styles.statLabel}>Taken</Text></View>
                <View style={[styles.statCard, { backgroundColor: '#f8d7da' }]}><Text style={[styles.statNumber, { color: '#dc3545' }]}>{stats.skipped}</Text><Text style={styles.statLabel}>Skipped</Text></View>
            </View>
            <FlatList data={history} keyExtractor={item => item._id} renderItem={renderItem} contentContainerStyle={styles.list}
                ListEmptyComponent={<View style={styles.emptyContainer}><Icon name="calendar-outline" size={50} color="#ccc" /><Text style={styles.emptyText}>No history available.</Text></View>} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', marginBottom: 10 },
    statCard: { flex: 1, backgroundColor: '#e8f4fd', marginHorizontal: 5, padding: 15, borderRadius: 12, alignItems: 'center' },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: '#007BFF' },
    statLabel: { fontSize: 12, color: '#6c757d', marginTop: 4 },
    list: { padding: 15 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 1 },
    date: { fontSize: 15, fontWeight: '600', color: '#212529' },
    time: { fontSize: 13, color: '#6c757d', marginTop: 2 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { textAlign: 'center', marginTop: 15, color: '#999', fontSize: 16 },
});

export default HistoryScreen;
