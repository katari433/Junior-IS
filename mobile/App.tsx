import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screen, setScreen] = useState<'register' | 'login' | 'home'>('register');


  async function handleCreateAccount() {
  if (
    firstName.trim() === '' ||
    lastName.trim() === '' ||
    email.trim() === '' ||
    password.length === 0
  ) {
    Alert.alert('Error', 'Please fill in all fields.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

if (!response.ok) {
  Alert.alert('Error', data.detail);
  return;
}

setFirstName('');
setLastName('');
setEmail('');
setPassword('');

Alert.alert('Success', data.message);
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not connect to the backend.');
  }
}

async function handleLogin() {
if(
  email.trim() === '' ||
  password.length === 0 
){
  Alert.alert('Error', 'Missing email or password');
    return;
 }
 try{
  const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

  const data = await response.json();
  if (!response.ok) {
  Alert.alert('Error', data.detail);
  return;
  }

  setScreen('home');
 }
 catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not connect to the backend.');
  }


}





  if (screen === 'login') {
  return (
    <View style={styles.container}>
      <Text>Login Screen</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"/>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry/>
      <Button
      title='Login'
      onPress={handleLogin}/>
      <Text>Don't have an account?</Text>
      <Button
      title='Create an account'
      onPress={() => setScreen('register')}/>
      <StatusBar style="auto" />
    </View>
  );
  }

  else if(screen === 'register'){
  return (
    <View style={styles.container}>
      <Text>Create Account</Text>

      <TextInput
       placeholder="First Name"
       value={firstName}
       onChangeText={setFirstName} />
      <TextInput
       placeholder="Last Name"
       value={lastName}
       onChangeText={setLastName}/>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"/>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry/>
      <Button
      title='Create Account'
      onPress={handleCreateAccount}/>
      <Text>Already have an account?</Text>
      <Button
      title='Login'
      onPress={() => setScreen('login')}/>
      <StatusBar style="auto" />
    </View>
  );
}

else if(screen === 'home'){
  return (
    <View style={styles.container}>
      <Text>DASHBOARD</Text>
      <StatusBar style="auto" />
    </View>
  );
}


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
