(function () {
    function initMBTIPage() {
        var answers = [];
        var questionContainer = document.getElementById('mbtiquestion');

        if (!questionContainer) {
            return;
        }

        function createQuestionMarkup(item, index) {
            var display = index === 0 ? 'block' : 'none';
            var questionNumber = index + 1;
            var choiceAId = 'question-' + questionNumber + '-choice-a';
            var choiceBId = 'question-' + questionNumber + '-choice-b';
            var partLabel = item.scoring === 'main' ? '主问题' : '补充问题';

            return `
                <form class="ac-custom ac-radio ac-circle question-form" data-index="${index}" autocomplete="off" style="display: ${display}">
                    <fieldset>
                        <div class="question-tag">${partLabel}</div>
                        <legend>${questionNumber}. ${item.question}</legend>
                        <ul>
                            <li>
                                <input id="${choiceAId}" name="answer-${questionNumber}" value="a" type="radio">
                                <label for="${choiceAId}">${item.choice_a.text}</label>
                                <svg viewBox="0 0 100 100"></svg>
                                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>
                            </li>
                            <li>
                                <input id="${choiceBId}" name="answer-${questionNumber}" value="b" type="radio">
                                <label for="${choiceBId}">${item.choice_b.text}</label>
                                <svg viewBox="0 0 100 100"></svg>
                                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>
                            </li>
                        </ul>
                    </fieldset>
                </form>`;
        }

        function appendSvgCheckScript() {
            var script = document.createElement('script');
            script.src = './static/js/vendor/svgcheckbx.js';
            document.body.appendChild(script);
        }

        fetch('./data/questions.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load questions');
                }
                return response.json();
            })
            .then(function (questionList) {
                questionList.forEach(function (item, index) {
                    questionContainer.insertAdjacentHTML('beforeend', createQuestionMarkup(item, index));
                });

                appendSvgCheckScript();

                questionContainer.addEventListener('change', function (event) {
                    var target = event.target;
                    if (!(target instanceof HTMLInputElement) || target.type !== 'radio') {
                        return;
                    }

                    var form = target.closest('form');
                    var questionIndex = Number(form.getAttribute('data-index'));
                    var question = questionList[questionIndex];
                    var selectedAnswer = target.value === 'a' ? question.choice_a : question.choice_b;
                    answers.push(selectedAnswer);

                    var nextForm = form ? form.nextElementSibling : null;

                    setTimeout(function () {
                        if (form) {
                            form.remove();
                        }

                        if (nextForm) {
                            nextForm.style.display = 'block';
                            nextForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 260);

                    if (answers.length === questionList.length) {
                        try {
                            var result = window.MBTIScoring.calculateResults(questionList, answers);
                            sessionStorage.setItem('trolleyFlavorScores', JSON.stringify(result.flavorScores));
                            sessionStorage.setItem('trolleyMainCounts', JSON.stringify(result.mainCounts));
                            window.location.href = './personality-detail.html?type=' + result.typeCode;
                        } catch (error) {
                            alert('评分失败，请刷新页面后重试。');
                        }
                    }
                });
            })
            .catch(function () {
                questionContainer.innerHTML = '<p>题库加载失败，请稍后重试。</p>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMBTIPage);
    } else {
        initMBTIPage();
    }
})();
