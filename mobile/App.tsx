import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert, Pressable } from 'react-native';
import { useState } from 'react';


export default function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screen, setScreen] = useState<'register' | 'login' | 'home' | 'account' | 'sendMoney' | 'transfer'>('register');
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [loggedInFirstName, setLoggedInFirstName] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [recipientAccount, setRecipientAccount] = useState('');
  const [sendingAmount, setSendingAmount] = useState('0.00');
  const [amountDigits, setAmountDigits] = useState('');
  const formattedAmount = (Number(amountDigits || '0') / 100).toFixed(2);

  
  async function displayAccounts(userId: number) {
  
    try{
        const response = await fetch('http://localhost:8000/findAccount', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    });


  const data = await response.json();

if (!response.ok) {
  
  Alert.alert('Error', 'Could not load accounts.');
  return;
}

setAccounts(data.accounts ?? []);
 
  
}catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not connect to the backend.');
  }


}

async function handleCreateNewAccount(accountName: string) {
  try {
    const response = await fetch('http://localhost:8000/createAccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: loggedInUserId,
        account_name: accountName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert('Error', data.detail);
      return;
    }

    await displayAccounts(loggedInUserId!);

    Alert.alert('Success', data.message);
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not create account.');
  }
}

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
  setLoggedInUserId(data.user_id);
  setLoggedInFirstName(data.first_name)
  await displayAccounts(data.user_id);
  setScreen('home');

 }
 catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not connect to the backend.');
  }


}

async function handleTransfer() {
  if (
    recipientAccount.trim() === '' ||
    sendingAmount.trim() === ''
  ) {
    Alert.alert('Error', 'Please fill in all fields.');
    return;
  }

  if (recipientAccount.length !== 10) {
    Alert.alert('Error', 'Account number must be 10 digits.');
    return;
  }

  if (!/^\d+$/.test(recipientAccount)) {
    Alert.alert('Error', 'Account number must contain only numbers.');
    return;
  }

  if (recipientAccount === selectedAccount.account_num) {
    Alert.alert('Error', 'Cannot send money to the same account.');
    return;
  }

  if (isNaN(Number(sendingAmount))) {
    Alert.alert('Error', 'Please enter a valid amount.');
    return;
  }

  if (Number(sendingAmount) <= 0) {
    Alert.alert('Error', 'Amount must be greater than zero.');
    return;
  }

  if (Number(sendingAmount) > Number(selectedAccount.balance)) {
    Alert.alert('Error', 'Insufficient funds.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/sendMoney', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_account_id: selectedAccount.id,
        recipient_account_num: recipientAccount,
        amount: Number(sendingAmount)
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert('Error', data.detail);
      return;
    }
    setRecipientAccount('');
    setSendingAmount('0.00');

    await displayAccounts(loggedInUserId!);

    setScreen('home');

    Alert.alert('Success', data.message);
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not send money.');
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

else if (screen === 'home') {
  if (accounts.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Welcome, {loggedInFirstName}</Text>
        <Text>You have no bank accounts, create one now.</Text>

        <Button
          title="Open Checking Account"
          onPress={() => handleCreateNewAccount('Checking')}
        />

        <Button
          title="Open Savings Account"
          onPress={() => handleCreateNewAccount('Savings')}
        />

        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <Text>Welcome, {loggedInFirstName}</Text>

    {accounts.map((account: any) => (
    <Pressable
      key={account.id}
      onPress={() => {
        setSelectedAccount(account);
        setScreen('account');
      }}
    >
    <View>
      <Text>{account.account_name}</Text>
      <Text>Account Number: {account.account_num}</Text>
      <Text>Balance: ${account.balance}</Text>
    </View>
  </Pressable>
  ))}

    <StatusBar style="auto" />
  </View>
);
}

else if (screen === 'account' && selectedAccount) {
  return (
    <View style={styles.container}>
      <Text>Account Details</Text>

      <Text>Available Balance</Text>
      <Text>${selectedAccount.balance}</Text>

      <Text>{selectedAccount.account_name}</Text>
      <Text>Account Number:</Text>
      <Text>{selectedAccount.account_num}</Text>

      <Button
      title="Send Money"
      onPress={() => setScreen('sendMoney')}
      />

      <Button
      title="Transfer"
      onPress={() => setScreen('transfer')}
      />

      <Button
        title="Back"
        onPress={() => setScreen('home')}
      />

      <StatusBar style="auto" />
    </View>
  );
}

else if (screen === 'sendMoney' && selectedAccount) {
  return (
    <View style={styles.container}>
      <Text>Send Money</Text>
      <Text>From: {selectedAccount.account_name}</Text>
      <Text>Balance: ${selectedAccount.balance}</Text>
      <Text>Reciepient Account Number:</Text>
      <TextInput
        placeholder="Recipient Account Number"
        value={recipientAccount}
        onChangeText={setRecipientAccount}
        keyboardType="number-pad"
      />

      <TextInput
        value={sendingAmount}
        onChangeText={(text) => {
        const digitsOnly = text.replace(/\D/g, '');
          setSendingAmount((Number(digitsOnly) / 100).toFixed(2));
      }}
      keyboardType="number-pad"
      />

      <Button
        title="Send"
        onPress={handleTransfer}
      />

      <Button
        title="Back"
        onPress={() => setScreen('account')}
      />

      <StatusBar style="auto" />
    </View>
  );
}

else if (screen === 'transfer' && selectedAccount) {
  return (
    <View style={styles.container}>
      <Text>Transfer Money</Text>

      <Text>From:</Text>
      <Text>{selectedAccount.account_name}</Text>
      <Text>Balance: ${selectedAccount.balance}</Text>

      <Text>Transfer To:</Text>

      {accounts
        .filter((account: any) => account.id !== selectedAccount.id)
        .map((account: any) => (
          <Button
            key={account.id}
            title={`${account.account_name} - ${account.account_num}`}
            onPress={() => {
              setRecipientAccount(account.account_num);
            }}
          />
        ))}

      <TextInput
        value={sendingAmount}
        onChangeText={(text) => {
          const digitsOnly = text.replace(/\D/g, '');
          setSendingAmount(
            (Number(digitsOnly) / 100).toFixed(2)
          );
        }}
        keyboardType="number-pad"
      />

      <Button
        title="Transfer"
        onPress={handleTransfer}
      />

      <Button
        title="Back"
        onPress={() => setScreen('account')}
      />

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

