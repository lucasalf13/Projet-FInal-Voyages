require('dotenv').config();
const apiKey = process.env.MISTRAL_API_KEY;

// Configuration de base pour l'API Mistral
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

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
        const response = await fetch(MISTRAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "mistral-tiny",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 800,
                top_p: 0.95
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const proposition = data.choices?.[0]?.message?.content || req.t('no_proposal_generated');
        res.json({ proposition });
    } catch (e) {
        console.error("Erreur Mistral AI :", e);
        res.json({ proposition: req.t('proposal_generation_error') });
    }
};
