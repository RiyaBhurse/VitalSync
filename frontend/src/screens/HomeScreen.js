import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const HomeScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events/today');
            setEvents(res.data);
        } catch (err) {
            if (err.response?.status !== 401) Alert.alert('Error', 'Failed to fetch timeline');
        } finally { setLoading(false); setRefreshing(false); }
    };

    useFocusEffect(useCallback(() => { fetchEvents(); }, []));
    const onRefresh = useCallback(() => { setRefreshing(true); fetchEvents(); }, []);

    const handleStatusUpdate = async (eventId, status) => {
        try {
            setEvents(prev => prev.map(e => e._id === eventId ? { ...e, status } : e));
            await api.post('/events/log', { eventId, status });
        } catch (err) { Alert.alert('Error', 'Failed to update'); fetchEvents(); }
    };

    const handleLogout = () => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }]);

    const takenCount = events.filter(e => e.status === 'TAKEN').length;
    const totalCount = events.length;
    const adherence = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

    const renderItem = ({ item }) => {
        const isPending = item.status === 'PENDING';
        const isTaken = item.status === 'TAKEN';
        return (
            <View style={styles.card}>
                <View style={styles.timeContainer}><Text style={styles.timeText}>{item.scheduledTime}</Text></View>
                <View style={styles.infoContainer}>
                    <Text style={styles.medName}>{item.referenceId?.name || 'Unknown'}</Text>
                    <Text style={styles.medDetails}>{item.referenceId?.dosage} • {item.referenceId?.instructions || 'No instructions'}</Text>
                </View>
                <View style={styles.actionContainer}>
                    {isPending ? (
                        <>
                            <TouchableOpacity onPress={() => handleStatusUpdate(item._id, 'TAKEN')} style={[styles.actionButton, styles.takenBtn]}><Icon name="checkmark" size={20} color="#fff" /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleStatusUpdate(item._id, 'SKIPPED')} style={[styles.actionButton, styles.skipBtn]}><Icon name="close" size={20} color="#fff" /></TouchableOpacity>
                        </>
                    ) : (
                        <View style={[styles.statusBadge, isTaken ? styles.takenBadge : styles.skippedBadge]}><Text style={styles.statusText}>{item.status}</Text></View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View><Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0]}!</Text><Text style={styles.subtext}>Here is your schedule for today.</Text></View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}><Icon name="log-out-outline" size={24} color="#dc3545" /></TouchableOpacity>
                </View>
                {totalCount > 0 && <View style={styles.statsBar}><Text style={styles.statsText}>Today's Progress: <Text style={styles.statsBold}>{takenCount}/{totalCount}</Text> ({adherence}%)</Text></View>}
            </View>
            {loading && !refreshing ? <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 40 }} /> : (
                <FlatList data={events} keyExtractor={item => item._id} renderItem={renderItem} contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<View style={styles.emptyContainer}><Icon name="medkit-outline" size={60} color="#ccc" /><Text style={styles.emptyText}>No medicines scheduled for today.</Text></View>} />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, paddingBottom: 15, elevation: 4 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingBottom: 10 },
    greeting: { fontSize: 26, fontWeight: '700', color: '#1a1a2e' },
    subtext: { fontSize: 14, color: '#6c757d', marginTop: 4 },
    logoutBtn: { padding: 8, borderRadius: 20, backgroundColor: '#fff0f0' },
    statsBar: { marginHorizontal: 20, backgroundColor: '#e8f4fd', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 },
    statsText: { fontSize: 14, color: '#495057' },
    statsBold: { fontWeight: 'bold', color: '#007BFF' },
    listContent: { padding: 15, paddingTop: 20 },
    card: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 12, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2 },
    timeContainer: { marginRight: 15, paddingRight: 15, borderRightWidth: 2, borderRightColor: '#e9ecef', minWidth: 55, alignItems: 'center' },
    timeText: { fontSize: 16, fontWeight: 'bold', color: '#007BFF' },
    infoContainer: { flex: 1 },
    medName: { fontSize: 16, fontWeight: '600', color: '#212529' },
    medDetails: { fontSize: 13, color: '#868e96', marginTop: 3 },
    actionContainer: { flexDirection: 'row', marginLeft: 10 },
    actionButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    takenBtn: { backgroundColor: '#28a745' },
    skipBtn: { backgroundColor: '#dc3545' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
    takenBadge: { backgroundColor: '#d4edda' },
    skippedBadge: { backgroundColor: '#f8d7da' },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#333' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 17, color: '#6c757d', marginTop: 15 },
});

export default HomeScreen;
