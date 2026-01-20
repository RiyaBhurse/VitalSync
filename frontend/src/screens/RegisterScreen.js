import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Switch, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isCaretaker, setIsCaretaker] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const { register, loading, error, clearError } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name || !email || !password) { Alert.alert('Error', 'Please fill required fields'); return; }
        if (isCaretaker && !inviteCode) { Alert.alert('Error', 'Invite code required for caretakers'); return; }
        await register(name, email, password, isCaretaker ? 'caretaker' : 'primary', inviteCode);
    };

    React.useEffect(() => { if (error) { Alert.alert('Registration Failed', error); clearError(); } }, [error]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
                    <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                    <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>I am a Caretaker</Text>
                        <Switch value={isCaretaker} onValueChange={setIsCaretaker} />
                    </View>
                    {isCaretaker && <TextInput style={styles.input} placeholder="Invite Code (Required)" value={inviteCode} onChangeText={setInviteCode} autoCapitalize="characters" />}
                    <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Already have an account? Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContent: { flexGrow: 1, justifyContent: 'center' },
    formContainer: { padding: 20, backgroundColor: 'white', margin: 20, borderRadius: 10, elevation: 3 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
    input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
    switchLabel: { fontSize: 16, color: '#333' },
    button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    linkText: { color: '#28a745', textAlign: 'center', marginTop: 20, fontSize: 14 },
});

export default RegisterScreen;
