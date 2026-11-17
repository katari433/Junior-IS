import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  authContainer: {
    width: '85%',
  },

  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#0b6e3f',
  },

  authTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111111',
  },

  authSubtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666666',
  },

  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#b7b7b7',
    borderRadius: 4,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#111111',
  },

  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0b6e3f',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  authQuestion: {
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 8,
    color: '#666666',
  },

  linkText: {
    textAlign: 'center',
    color: '#0b6e3f',
    fontWeight: '600',
  },

  dashboardContainer: {
    width: '88%',
  },

  dashboardWelcome: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 25,
  },

  dashboardSubtitle: {
    fontSize: 18,
    color: '#555555',
    marginBottom: 12,
  },
  
  accountCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },


  accountCard: {
    width: '100%',
    backgroundColor: '#0b6e3f',
    borderWidth: 1,
    borderColor: '#0b6e3f',
    borderRadius: 6,
    padding: 18,
    marginBottom: 15,
  },

  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },

  accountCardsubtext: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 4,
  },

  accountNumber: {
    fontSize: 14,
    color: '#e5e7eb',
  },

  accountBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  secondaryButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#0b6e3f',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  secondaryButtonText: {
    color: '#0b6e3f',
    fontSize: 16,
    fontWeight: '600',
  },

  screenContent: {
    width: '88%',
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 24,
  },

  infoCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 6,
    padding: 18,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },

  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 18,
  },

  infoText: {
    fontSize: 16,
    color: '#111111',
    marginBottom: 6,
  },

  formLabel: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 8,
  },

  moneyInput: {
    width: '100%',
    height: 55,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#b7b7b7',
    borderRadius: 4,
    paddingHorizontal: 15,
    marginBottom: 18,
    color: '#111111',
    fontSize: 20,
  },

  actionButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0b6e3f',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  outlineButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#0b6e3f',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  outlineButtonText: {
    color: '#0b6e3f',
    fontSize: 16,
    fontWeight: '600',
  },

  transactionCard: {
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },

  transactionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  transactionAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0b6e3f',
  },

  transactionInfo: {
    fontSize: 14,
    color: '#666666',
  },

  transactionType: {
    fontSize: 14,
    color: '#333333',
    marginTop: 6,
  },

  accountDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },

  accountNumberValue: {
    fontSize: 15,
    color: '#555555',
  },
});

export default styles;