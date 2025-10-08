require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.proposeVoyage = async (req, res) => {
    const { type, duree, adultes, enfants, budget, periode } = req.body;
    const lang = req.language || 'fr';
    const prompt = `Je souhaite un voyage personnalisé en France selon ces critères :
- Type de voyage : ${type}
- Durée : ${duree} jours
- Nombre de personnes : ${adultes} adulte(s)${enfants && enfants > 0 ? `, ${enfants} enfant(s)` : ''}
- Budget : ${budget}€
- Période : ${periode}
Donne-moi :
1. Une destination adaptée en France
2. 3 à 5 activités à faire sur place
3. Une courte description du séjour
Réponds en ${lang === 'fr' ? 'français' : lang === 'en' ? 'anglais' : lang}.`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 400
        });
        const proposition = completion.choices[0]?.message?.content || req.t('no_proposal_generated');
        res.json({ proposition });
    } catch (e) {
        console.error("Erreur OpenAI :", e);
        res.json({ proposition: req.t('proposal_generation_error') });
    }
};
