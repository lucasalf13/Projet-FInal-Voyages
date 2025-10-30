require('dotenv').config();
const MistralClient = require('@mistralai/mistralai').MistralClient;
const apiKey = process.env.MISTRAL_API_KEY;
const client = new MistralClient(apiKey);

exports.proposeVoyage = async (req, res) => {
    const { type, duree, adultes, enfants, budget, periode } = req.body;
    const lang = req.language || 'fr';
    const prompt = `Je souhaite un voyage personnalisé en France selon ces critères :
- Type de voyage : ${type}
- Durée : ${duree} jours
- Nombre de personnes : ${adultes} adulte(s)${enfants && enfants > 0 ? `, ${enfants} enfant(s)` : ''}
- Budget : ${budget}€
- Période : ${periode}

Instructions spécifiques :
- Agis comme un expert en voyages en France
- Donne des suggestions précises et pertinentes
- Tiens compte du budget et du nombre de personnes
- Propose des activités adaptées à la composition du groupe${enfants && enfants > 0 ? ' (incluant des enfants)' : ''}

Donne-moi :
1. Une destination adaptée en France avec une justification du choix
2. 3 à 5 activités concrètes à faire sur place avec leurs prix approximatifs
3. Une courte description inspirante du séjour
4. Des conseils pratiques pour optimiser le budget

Réponds en ${lang === 'fr' ? 'français' : lang === 'en' ? 'anglais' : lang}.`;

    try {
        const chatResponse = await client.chat({
            model: "mistral-medium",  // ou "mistral-small" pour une version plus légère
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 800,
            top_p: 0.95,
            random_seed: 42  // Pour des résultats plus cohérents
        });

        const proposition = chatResponse.choices[0]?.message?.content || req.t('no_proposal_generated');
        res.json({ proposition });
    } catch (e) {
        console.error("Erreur Mistral AI :", e);
        res.json({ proposition: req.t('proposal_generation_error') });
    }
};
