const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.proposeVoyage = async (req, res) => {
    const { type, duree, adultes, enfants, budget, periode } = req.body;
    const lang = req.language || 'fr';
    const langues = {
        fr: "Réponds en français.",
        en: "Reply in English.",
        es: "Responde en español.",
        it: "Rispondi in italiano."
    };
    const consigne = langues[lang] || langues['fr'];
    const prompt = `${consigne} Je souhaite un voyage personnalisé en France selon ces critères : 
- Type de voyage : ${type}
- Durée : ${duree} jours
- Nombre de personnes : ${adultes} adulte(s)${enfants && enfants > 0 ? `, ${enfants} enfant(s)` : ''}
- Budget : ${budget}€
- Période : ${periode}

Donne-moi :
1. Une destination adaptée en France
2. 3 à 5 activités à faire sur place
3. Une courte description du séjour

Présente la réponse de façon claire, concise et pratique, sans répéter la demande.`;

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt })
        });
        const data = await response.json();
        console.log("Réponse Hugging Face :", data);
        const proposition = data[0]?.generated_text || data.generated_text || req.t('no_proposal_generated');
        res.json({ proposition });
    } catch (e) {
        res.json({ proposition: req.t('proposal_generation_error') });
    }
};
