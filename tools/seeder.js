const admin = require('firebase-admin');

// Initialize Firebase Admin (Assuming environment is set up or using default credential)
// In a real scenario, you would provide serviceAccountKey.json
if (!admin.apps.length) {
    // This part is tricky in a sandbox without credentials.
    // I will write the code structure.
    // If you have credentials, set GOOGLE_APPLICATION_CREDENTIALS env var.
    try {
        admin.initializeApp();
    } catch (e) {
        console.warn("Could not initialize firebase-admin. Make sure credentials are set.");
        // Proceeding might fail if not authenticated
    }
}

const db = admin.firestore();

// Helper to slugify text
const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

// Seed Data
const TEAMS = [
    { nombre: 'Boca Juniors', division: 'Primera', shieldUrl: 'url_to_shield' },
    { nombre: 'River Plate', division: 'Primera', shieldUrl: 'url_to_shield' }
];

const PLAYERS = [
    { nombre: 'Lionel Messi', teamName: 'Boca Juniors', posiciones: ['MCO', 'ED', 'DC'] }, // Just an example
    { nombre: 'Juan Roman Riquelme', teamName: 'Boca Juniors', posiciones: ['MCO'] },
    { nombre: 'Franco Armani', teamName: 'River Plate', posiciones: ['PO'] },
    { nombre: 'Enzo Perez', teamName: 'River Plate', posiciones: ['MCD', 'MC'] }
];

// Spanish Position Codes for Validation
const VALID_POSITIONS = ['PO', 'DFD', 'DFC', 'DFI', 'MCD', 'MC', 'MCO', 'MD', 'MI', 'DC', 'EI', 'ED'];

const seed = async () => {
    try {
        console.log('Starting seed process...');

        // 1. Clear existing collections
        const collections = ['equipos', 'jugadores', 'niveles', 'desafios', 'configuracion'];
        for (const colName of collections) {
            const colRef = db.collection(colName);
            const snapshot = await colRef.get();
            if (snapshot.size === 0) continue;

            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Cleared collection: ${colName}`);
        }

        // 2. Populate Equipos
        const teamMap = {}; // name -> id
        const batchTeams = db.batch();
        for (const team of TEAMS) {
            const slug = slugify(team.nombre);
            teamMap[team.nombre] = slug;
            const docRef = db.collection('equipos').doc(slug);
            batchTeams.set(docRef, { ...team, slug });
        }
        await batchTeams.commit();
        console.log('Populated Equipos');

        // 3. Populate Jugadores
        const batchPlayers = db.batch();
        const playerNames = [];
        for (const player of PLAYERS) {
            const slug = slugify(player.nombre);
            const teamId = teamMap[player.teamName];

            if (!teamId) {
                console.warn(`Team not found for player: ${player.nombre}`);
                continue;
            }

            // Generate variations for respuestasCorrectas (simple logic here)
            const variations = [
                player.nombre,
                player.nombre.toLowerCase(),
                player.nombre.split(' ').pop(), // Last name
                slug
            ];

            const playerData = {
                nombre: player.nombre,
                slug: slug,
                teamId: teamId,
                teamName: player.teamName,
                posiciones: player.posiciones,
                respuestasCorrectas: variations // Storing here or logic might be in niveles?
                // Prompt says: "Generate respuestasCorrectas variations for each player automatically."
                // But where does it go? "niveles/{gameId}... Fields: ... respuestasCorrectas".
                // Ah, niveles have respuestasCorrectas. Players have slug.
                // But typically answers are related to the player in the level.
                // I will store slug in player doc anyway.
            };

            const docRef = db.collection('jugadores').doc(slug);
            batchPlayers.set(docRef, playerData);
            playerNames.push(player.nombre);
        }
        await batchPlayers.commit();
        console.log('Populated Jugadores');

        // 4. Populate Niveles (Example)
        // niveles/{gameId}_{teamId}_{levelNum}
        const batchLevels = db.batch();
        // Create a dummy level for Boca
        const teamId = teamMap['Boca Juniors'];
        if (teamId) {
            const gameId = 'juego1';
            const levelNum = 1;
            const levelId = `${gameId}_${teamId}_${levelNum}`;
            const docRef = db.collection('niveles').doc(levelId);

            batchLevels.set(docRef, {
                juegoId: gameId,
                teamId: teamId,
                levelNum: levelNum,
                respuestasCorrectas: ['messi', 'lionel messi'], // Example based on the player logic
                configuracion: { timeLimit: 60 }
            });
        }
        await batchLevels.commit();
        console.log('Populated Niveles');

        // 5. Populate Global Config
        // configuracion/global: cached arrays of team names and formation layouts
        const batchConfig = db.batch();
        const globalRef = db.collection('configuracion').doc('global');
        batchConfig.set(globalRef, {
            teamNames: Object.keys(teamMap),
            formations: {
                '4-4-2': ['PO', 'DFD', 'DFC', 'DFC', 'DFI', 'MD', 'MC', 'MC', 'MI', 'DC', 'DC'],
                '4-3-3': ['PO', 'DFD', 'DFC', 'DFC', 'DFI', 'MCD', 'MC', 'MC', 'ED', 'DC', 'EI']
            }
        });
        await batchConfig.commit();
        console.log('Populated Global Config');

        console.log('Seeding complete.');
    } catch (error) {
        console.error('Seeding failed:', error);
    }
};

seed();
