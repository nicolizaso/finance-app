import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";

// Centralized Position Codes (Spanish Standard)
const ROLE_MAP = {
  PO: 'Portero',
  DFD: 'Defensa Derecho',
  DFC: 'Defensa Central',
  DFI: 'Defensa Izquierdo',
  MCD: 'Mediocentro Defensivo',
  MC: 'Mediocentro',
  MCO: 'Mediocentro Ofensivo',
  MD: 'Medio Derecho',
  MI: 'Medio Izquierdo',
  DC: 'Delantero Centro',
  EI: 'Extremo Izquierdo',
  ED: 'Extremo Derecho'
};

const Game3 = ({ activeTeamId }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formation, setFormation] = useState({}); // Example state for formation slots

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!activeTeamId) return;

      setLoading(true);
      try {
        const q = query(collection(db, "jugadores"), where("teamId", "==", activeTeamId));
        const querySnapshot = await getDocs(q);
        const fetchedPlayers = [];
        querySnapshot.forEach((doc) => {
          fetchedPlayers.push(doc.data());
        });
        setPlayers(fetchedPlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [activeTeamId]);

  /**
   * Smart Selector Logic
   * If a player has multiple positions, find the best empty slot.
   * @param {Object} player - Player object with 'posiciones' array
   */
  const handlePlayerSelect = (player) => {
    const { posiciones } = player;
    let selectedPosition = null;

    // Check if player has multiple positions
    if (posiciones && posiciones.length > 0) {
      if (posiciones.length === 1) {
        selectedPosition = posiciones[0];
      } else {
        // Smart Logic: Find the first empty slot matching one of the player's positions
        for (const pos of posiciones) {
          if (!formation[pos]) { // Assuming formation[pos] holds the player in that slot, null/undefined if empty
            selectedPosition = pos;
            break;
          }
        }

        // If all matching slots are full, default to the first position or handle overlap
        if (!selectedPosition) {
            selectedPosition = posiciones[0];
        }
      }
    }

    if (selectedPosition) {
        console.log(`Assigning ${player.nombre} to ${selectedPosition} (${ROLE_MAP[selectedPosition]})`);
        // Update formation state logic here
        setFormation(prev => ({
            ...prev,
            [selectedPosition]: player
        }));
    }
  };

  if (loading) return <div>Loading players...</div>;

  return (
    <div className="game-container">
      <h1>Game 3 - Squad Builder</h1>
      <div className="formation-board">
        {/* Render formation slots based on selected tactic */}
        {Object.keys(ROLE_MAP).map(role => (
            <div key={role} className="formation-slot">
                <span>{role}</span>
                {formation[role] ? <div>{formation[role].nombre}</div> : <div>Empty</div>}
            </div>
        ))}
      </div>

      <div className="player-list">
        <h2>Available Players</h2>
        <ul>
          {players.map(player => (
            <li key={player.slug} onClick={() => handlePlayerSelect(player)}>
              {player.nombre} ({player.posiciones.join(', ')})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Game3;
