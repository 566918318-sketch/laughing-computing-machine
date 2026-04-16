(function (global) {
    var VALID_TYPES = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
    var TYPE_PAIRS = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
    var DEFAULT_FLAVOR_KEYS = ['dirty_hands', 'convention', 'apology', 'system_fix', 'face_response', 'mercy_action', 'decision_burden', 'witness_memory'];

    function createEmptyFlavorScores() {
        return DEFAULT_FLAVOR_KEYS.reduce(function (accumulator, key) {
            accumulator[key] = 0;
            return accumulator;
        }, {});
    }

    function calculateResults(questionList, answerList) {
        if (!Array.isArray(questionList) || !Array.isArray(answerList) || questionList.length !== answerList.length) {
            throw new Error('question list and answer list mismatch');
        }

        var mainCounts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        var flavorScores = createEmptyFlavorScores();

        answerList.forEach(function (answer, index) {
            var question = questionList[index];
            if (!question || !answer) {
                return;
            }

            if (question.scoring === 'main') {
                if (VALID_TYPES.indexOf(answer.value) === -1) {
                    throw new Error('invalid main score value');
                }
                mainCounts[answer.value] += 1;
                return;
            }

            if (question.scoring === 'flavor' && answer.effects) {
                Object.keys(answer.effects).forEach(function (key) {
                    flavorScores[key] = (flavorScores[key] || 0) + answer.effects[key];
                });
            }
        });

        var typeCode = TYPE_PAIRS.map(function (pair) {
            return mainCounts[pair[0]] > mainCounts[pair[1]] ? pair[0] : pair[1];
        }).join('');

        return {
            typeCode: typeCode,
            mainCounts: mainCounts,
            flavorScores: flavorScores
        };
    }

    global.MBTIScoring = {
        calculateResults: calculateResults
    };
})(window);
