import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import styles from './styles';


export default function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screen, setScreen] = useState<'register' | 'login' | 'home' | 'account' | 'sendMoney' | 'transfer' | 'history' | 'admin' | 'auditLogs' | 'fraudReview'>('login');
  const [userRole, setuserRole] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [loggedInFirstName, setLoggedInFirstName] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [recipientAccount, setRecipientAccount] = useState('');
  const [sendingAmount, setSendingAmount] = useState('0.00');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);

  
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

async function displayFraudFlags() {
  try {
    const response = await fetch('http://localhost:8000/fraudFlags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: loggedInUserId
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert('Error', data.detail);
      return;
    }

    setFraudFlags(data.flags ?? []);
    setScreen('fraudReview');
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not load fraud flags.');
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
  setuserRole(data.role)
  setLoggedInUserId(data.user_id);
  setLoggedInFirstName(data.first_name)
  if (data.role === 'admin') {
    setScreen('admin');
  } else {
    await displayAccounts(data.user_id);
    setScreen('home');
  }

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

async function displayTransactionHistory(accountId: number) {
  try {
    const response = await fetch('http://localhost:8000/transactionHistory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bank_account_id: accountId
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert('Error', data.detail);
      return;
    }

    setTransactions(data.transactions ?? []);
    setScreen('history');

  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not load transaction history.');
  }
}

async function displayAuditLogs() {
  try {
    const response = await fetch('http://localhost:8000/auditLogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: loggedInUserId
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert('Error', data.detail);
      return;
    }

    setAuditLogs(data.logs ?? []);
    setScreen('auditLogs');
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Could not load audit logs.');
  }
}




if (screen === 'login') {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.appTitle}>Banking App</Text>
        <Text style={styles.authTitle}>Welcome Back</Text>
        <Text style={styles.authSubtitle}>
          Log in to access your accounts
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={styles.primaryButton}
          onPress={handleLogin}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>

        <Text style={styles.authQuestion}>
          Don't have an account?
        </Text>

        <Pressable onPress={() => setScreen('register')}>
          <Text style={styles.linkText}>Create an account</Text>
        </Pressable>
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}


else if(screen === 'register'){
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.appTitle}>Banking App</Text>
        <Text style={styles.authTitle}>Create An Account</Text>
        <Text style={styles.authSubtitle}>Register Now To Started</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#6b7280"
          value={firstName}
          onChangeText={setFirstName} 
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#6b7280"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable
          style={styles.primaryButton}
          onPress={handleCreateAccount}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>  
        </Pressable>

        <Text style={styles.authQuestion}>Already have an account?</Text>
        <Pressable onPress={() => setScreen('login')}>
          <Text style={styles.linkText}>Login</Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

else if (screen === 'home') {
  if (accounts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.dashboardContainer}>
          <Text style={styles.dashboardWelcome}>
            Welcome, {loggedInFirstName}
          </Text>

          <Text style={styles.dashboardSubtitle}>
            You have no bank accounts yet.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => handleCreateNewAccount('Checking')}
          >
            <Text style={styles.primaryButtonText}>
              Open Checking Account
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => handleCreateNewAccount('Savings')}
          >
            <Text style={styles.secondaryButtonText}>
              Open Savings Account
            </Text>
          </Pressable>
        </View>

        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dashboardContainer}>
        <Text style={styles.dashboardWelcome}>
          Welcome, {loggedInFirstName}
        </Text>

        <Text style={styles.dashboardSubtitle}>
          Your Accounts
        </Text>

        {accounts.map((account: any) => (
          <Pressable
            key={account.id}
            style={styles.accountCard}
            onPress={() => {
              setSelectedAccount(account);
              setScreen('account');
            }}
          >
            <View style={styles.accountCardTop}>
              <Text style={styles.accountName}>
                {account.account_name}
              </Text>
              
              <Text style={styles.accountNumber}>
                {account.account_num}
              </Text> 
            </View>

            <Text style={styles.accountCardsubtext}>
                Available Balance:
              </Text>

              <Text style={styles.accountBalance}>
                ${Number(account.balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            
          </Pressable>
        ))}
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

else if (screen === 'account' && selectedAccount) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Account Details</Text>

        <View style={styles.infoCard}>
          <View style={styles.accountDetailRow}>
            <Text style={styles.infoText}>
              {selectedAccount.account_name}
            </Text>

            <Text style={styles.accountNumberValue}>
              {selectedAccount.account_num}
            </Text>
          </View>

          <View style={styles.accountDetailRow}>
            <Text style={styles.label}>
              Available Balance
            </Text>

            <Text style={styles.value}>
              ${selectedAccount.balance}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.actionButton}
          onPress={() => setScreen('sendMoney')}
        >
          <Text style={styles.actionButtonText}>Send Money</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => setScreen('transfer')}
        >
          <Text style={styles.actionButtonText}>Transfer</Text>
        </Pressable>

        <Pressable
          style={styles.outlineButton}
          onPress={() => displayTransactionHistory(selectedAccount.id)}
        >
          <Text style={styles.outlineButtonText}>
            Transaction History
          </Text>
        </Pressable>

        <Pressable
          style={styles.outlineButton}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.outlineButtonText}>Back</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

else if (screen === 'sendMoney' && selectedAccount) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Send Money</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.infoText}>
            {selectedAccount.account_name}
          </Text>

          <Text style={styles.label}>Available Balance</Text>
          <Text style={styles.value}>
            ${selectedAccount.balance}
          </Text>
        </View>

        <Text style={styles.formLabel}>
          Recipient Account Number
        </Text>

        <TextInput
          style={styles.input}
          placeholder="10-digit account number"
          placeholderTextColor="#6b7370"
          value={recipientAccount}
          onChangeText={setRecipientAccount}
          keyboardType="number-pad"
        />

        <Text style={styles.formLabel}>Amount</Text>

        <TextInput
          style={styles.moneyInput}
          value={sendingAmount}
          onChangeText={(text) => {
            const digitsOnly = text.replace(/\D/g, '');
            setSendingAmount(
              (Number(digitsOnly) / 100).toFixed(2)
            );
          }}
          keyboardType="number-pad"
        />

        <Pressable
          style={styles.actionButton}
          onPress={handleTransfer}
        >
          <Text style={styles.actionButtonText}>Send Money</Text>
        </Pressable>

        <Pressable
          style={styles.outlineButton}
          onPress={() => setScreen('account')}
        >
          <Text style={styles.outlineButtonText}>Back</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

else if (screen === 'transfer' && selectedAccount) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Transfer Money</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>From</Text>

          <Text style={styles.infoText}>
            {selectedAccount.account_name}
          </Text>

          <Text style={styles.label}>Available Balance</Text>

          <Text style={styles.value}>
            ${selectedAccount.balance}
          </Text>
        </View>

        <Text style={styles.formLabel}>Transfer To</Text>

        {accounts
          .filter((account: any) => account.id !== selectedAccount.id)
          .map((account: any) => (
            <Pressable
              key={account.id}
              style={styles.outlineButton}
              onPress={() => {
                setRecipientAccount(account.account_num);
              }}
            >
              <Text style={styles.outlineButtonText}>
                {account.account_name} - {account.account_num}
              </Text>
            </Pressable>
          ))}

        <Text style={styles.formLabel}>Amount</Text>

        <TextInput
          style={styles.moneyInput}
          value={sendingAmount}
          onChangeText={(text) => {
            const digitsOnly = text.replace(/\D/g, '');

            setSendingAmount(
              (Number(digitsOnly) / 100).toFixed(2)
            );
          }}
          keyboardType="number-pad"
        />

        <Pressable
          style={styles.actionButton}
          onPress={handleTransfer}
        >
          <Text style={styles.actionButtonText}>Transfer</Text>
        </Pressable>

        <Pressable
          style={styles.outlineButton}
          onPress={() => setScreen('account')}
        >
          <Text style={styles.outlineButtonText}>Back</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

else if (screen === 'history' && selectedAccount) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Transaction History</Text>

        <Text style={styles.dashboardSubtitle}>
          {selectedAccount.account_name}
        </Text>

        {transactions.length === 0 ? (
          <Text style={styles.dashboardSubtitle}>
            No transactions yet.
          </Text>
        ) : (
          transactions.map((transaction: any) => (
            <View
              key={transaction.id}
              style={styles.transactionCard}
            >
              <View style={styles.transactionTopRow}>
                <Text style={styles.transactionInfo}>
                  {new Date(transaction.created_at + 'Z')
                    .toLocaleDateString('en-CA', {
                      timeZone: 'America/New_York',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                    .replaceAll('-', '/')} •{' '}
                  {new Date(transaction.created_at + 'Z')
                    .toLocaleTimeString('en-US', {
                      timeZone: 'America/New_York',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                </Text>

                <Text style={styles.transactionAmount}>
                  {transaction.sender_account_id === selectedAccount.id
                    ? `-$${transaction.amount}`
                    : `+$${transaction.amount}`}
                </Text>
              </View>

              <Text style={styles.transactionType}>
                {transaction.sender_account_id === selectedAccount.id
                  ? 'Sent'
                  : 'Received'}
              </Text>
            </View>
          ))
        )}

        <Pressable
          style={styles.outlineButton}
          onPress={() => setScreen('account')}
        >
          <Text style={styles.outlineButtonText}>Back</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

else if (screen === 'admin') {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Admin Dashboard</Text>

        <Text style={styles.dashboardSubtitle}>
          Welcome, {loggedInFirstName}
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={displayAuditLogs}
        >
          <Text style={styles.actionButtonText}>
            View Audit Logs
          </Text>
        </Pressable>

        <Pressable
          style={styles.outlineButton}
          onPress={displayFraudFlags}
        >
          <Text style={styles.outlineButtonText}>
            Fraud Review
          </Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

else if (screen === 'auditLogs') {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Audit Logs</Text>

        {auditLogs.length === 0 ? (
          <Text style={styles.dashboardSubtitle}>
            No audit logs yet.
          </Text>
        ) : (
          auditLogs.map((log: any) => (
            <View key={log.id} style={styles.transactionCard}>
              <View style={styles.transactionTopRow}>
                <Text style={styles.infoText}>
                  {log.first_name} {log.last_name}
                </Text>

                <Text style={styles.transactionInfo}>
                  {log.action}
                </Text>
              </View>

              <Text style={styles.transactionInfo}>
                {log.details}
              </Text>
            </View>
          ))
        )}

        <Pressable
          style={styles.outlineButton}
          onPress={() => setScreen('admin')}
        >
          <Text style={styles.outlineButtonText}>Back</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

else if (screen === 'fraudReview') {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Fraud Review</Text>

        {fraudFlags.length === 0 ? (
          <Text style={styles.dashboardSubtitle}>
            No flagged transactions.
          </Text>
        ) : (
          fraudFlags.map((flag: any) => (
            <View key={flag.id} style={styles.transactionCard}>
              <View style={styles.transactionTopRow}>
                <Text style={styles.infoText}>
                  ${flag.amount}
                </Text>

                <Text style={styles.transactionInfo}>
                  {flag.rule_triggered}
                </Text>
              </View>

              <Text style={styles.transactionInfo}>
                Sender Account ID: {flag.sender_account_id}
              </Text>

              <Text style={styles.transactionInfo}>
                Recipient Account ID: {flag.recipient_account_id}
              </Text>
            </View>
          ))
        )}

        <Pressable
          style={styles.outlineButton}
          onPress={() => setScreen('admin')}
        >
          <Text style={styles.outlineButtonText}>Back</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

}

