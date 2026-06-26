import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const ACTIONS = ['Skip', 'Reverse', 'Draw Two', 'Wild', 'Wild Draw Four'];

const createDeck = () => {
  let deck = [];
  let id = 0;

  // Regular cards (0-9)
  COLORS.forEach(color => {
    for (let number = 0; number <= 9; number++) {
      if (number === 0) {
        deck.push({ id: id++, color, number, type: 'number' });
      } else {
        deck.push({ id: id++, color, number, type: 'number' });
        deck.push({ id: id++, color, number, type: 'number' });
      }
    }
  });

  // Action cards
  COLORS.forEach(color => {
    for (let action of ['Skip', 'Reverse', 'Draw Two']) {
      deck.push({ id: id++, color, action, type: 'action' });
      deck.push({ id: id++, color, action, type: 'action' });
    }
  });

  // Wild cards
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'black', action: 'Wild', type: 'wild' });
    deck.push({ id: id++, color: 'black', action: 'Wild Draw Four', type: 'wild' });
  }

  return deck.sort(() => Math.random() - 0.5);
};

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const GameScreen = () => {
  const [deck, setDeck] = useState(createDeck());
  const [discardPile, setDiscardPile] = useState([deck[0]]);
  const [playerHand, setPlayerHand] = useState(deck.slice(1, 8));
  const [computerHand, setComputerHand] = useState(Array(7).fill(null).map((_, i) => ({ id: 100 + i, hidden: true })));
  const [currentColor, setCurrentColor] = useState(deck[0].color);
  const [gameStatus, setGameStatus] = useState('Your turn');
  const [turn, setTurn] = useState('player');
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);

  const canPlayCard = (card) => {
    const lastCard = discardPile[discardPile.length - 1];
    if (card.type === 'wild') return true;
    if (card.color === currentColor) return true;
    if (card.type === 'number' && card.number === lastCard.number) return true;
    if (card.type === 'action' && card.action === lastCard.action) return true;
    return false;
  };

  const playCard = (card, index) => {
    if (turn !== 'player') {
      Alert.alert('Not your turn!');
      return;
    }

    if (!canPlayCard(card)) {
      Alert.alert('Cannot play this card!');
      return;
    }

    const newHand = playerHand.filter((_, i) => i !== index);
    setPlayerHand(newHand);
    setDiscardPile([...discardPile, card]);
    setCurrentColor(card.color);

    if (newHand.length === 0) {
      Alert.alert('You Won!', 'Congratulations!');
      resetGame();
      return;
    }

    setGameStatus('Computer\'s turn');
    setTurn('computer');
    setTimeout(() => computerTurn(newHand), 1000);
  };

  const computerTurn = (playerCurrentHand) => {
    const playableCards = computerHand.filter(card => canPlayCard(card));

    if (playableCards.length === 0) {
      const remainingDeck = deck.filter(card => !discardPile.includes(card) && !playerCurrentHand.includes(card));
      if (remainingDeck.length > 0) {
        const drawnCard = remainingDeck[0];
        setComputerHand([...computerHand, drawnCard]);
        setGameStatus('Your turn');
        setTurn('player');
        return;
      }
    }

    const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
    setComputerHand(computerHand.filter(card => card.id !== cardToPlay.id));
    setDiscardPile([...discardPile, cardToPlay]);
    setCurrentColor(cardToPlay.color);

    if (computerHand.length === 1) {
      Alert.alert('Computer Won!', 'Better luck next time!');
      resetGame();
      return;
    }

    setGameStatus('Your turn');
    setTurn('player');
  };

  const drawCard = () => {
    if (turn !== 'player') {
      Alert.alert('Not your turn!');
      return;
    }

    if (deck.length === 0) {
      Alert.alert('No more cards in deck!');
      return;
    }

    const newCard = deck[0];
    setPlayerHand([...playerHand, newCard]);
    setDeck(deck.slice(1));
    setGameStatus('Computer\'s turn');
    setTurn('computer');
    setTimeout(() => computerTurn([...playerHand, newCard]), 1000);
  };

  const resetGame = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setDiscardPile([newDeck[0]]);
    setPlayerHand(newDeck.slice(1, 8));
    setComputerHand(Array(7).fill(null).map((_, i) => ({ id: 100 + i, hidden: true })));
    setCurrentColor(newDeck[0].color);
    setGameStatus('Your turn');
    setTurn('player');
  };

  const getCardColor = (card) => {
    if (card.color === 'red') return '#FF6B6B';
    if (card.color === 'blue') return '#4ECDC4';
    if (card.color === 'green') return '#95E1D3';
    if (card.color === 'yellow') return '#FFE66D';
    if (card.color === 'black') return '#2C3E50';
    return '#FFFFFF';
  };

  const renderCard = (card, index, isPlayer = true) => {
    if (card.hidden) {
      return (
        <View key={card.id} style={[styles.card, { backgroundColor: '#3498db' }]}>
          <Text style={styles.cardText}>?</Text>
        </View>
      );
    }

    const cardContent = card.type === 'number' ? card.number : card.action || card.type;

    return (
      <TouchableOpacity
        key={card.id}
        style={[styles.card, { backgroundColor: getCardColor(card) }]}
        onPress={() => isPlayer && playCard(card, index)}
      >
        <Text style={styles.cardText}>{cardContent}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>UNO Game</Text>
        <Text style={styles.status}>{gameStatus}</Text>
      </View>

      <View style={styles.scoreBoard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>You</Text>
          <Text style={styles.scoreValue}>{playerHand.length}</Text>
        </View>
        <View style={styles.discardArea}>
          <Text style={styles.deckLabel}>Current Card</Text>
          {renderCard(discardPile[discardPile.length - 1], 0, false)}
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Computer</Text>
          <Text style={styles.scoreValue}>{computerHand.length}</Text>
        </View>
      </View>

      <View style={styles.computerHand}>
        <Text style={styles.handLabel}>Computer Hand:</Text>
        <View style={styles.cardRow}>
          {computerHand.map((card, index) => renderCard(card, index, false))}
        </View>
      </View>

      <View style={styles.playerHand}>
        <Text style={styles.handLabel}>Your Hand:</Text>
        <View style={styles.cardRow}>
          {playerHand.map((card, index) => renderCard(card, index, true))}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={drawCard}>
          <Text style={styles.buttonText}>Draw Card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetGame}>
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const App = () => {
  return <GameScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  status: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 8,
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 14,
  },
  scoreValue: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  discardArea: {
    alignItems: 'center',
  },
  deckLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
  },
  computerHand: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  playerHand: {
    paddingHorizontal: 10,
    marginBottom: 15,
    flex: 1,
  },
  handLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: 60,
    height: 90,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default App;
