(function () {
    function getQueryType() {
        // 详情页通过 ?type=INTJ 这样的查询参数决定要读取哪一条人格数据。
        var match = window.location.search.match(/[?&]type=([^&]+)/i);
        return match ? decodeURIComponent(match[1]).toUpperCase() : '';
    }

    function findPersonality(personalities, type) {
        // 数据文件是数组结构，这里按 type 字段顺序查找对应人格。
        for (var index = 0; index < personalities.length; index += 1) {
            if (personalities[index].type === type) {
                return personalities[index];
            }
        }

        return null;
    }

    function updateMeta(selector, content) {
        // 同步更新标题和描述，便于 SEO 与社交分享展示正确的人格信息。
        var element = document.querySelector(selector);

        if (element) {
            element.setAttribute('content', content);
        }
    }

    function buildFlavorSnippet(type, scores) {
        if (!scores || !Object.keys(scores).length) {
            return '';
        }

        var snippets = [];
        function high(key) { return (scores[key] || 0) >= 2; }

        if (['ENTJ', 'ESTJ', 'ISTJ'].indexOf(type) !== -1) {
            if (high('convention')) {
                snippets.push('你在这一型里更偏向相信既有处理方式，而不是在现场重新立法。');
            }
            if (high('dirty_hands')) {
                snippets.push('你也更能接受“手脏了，但事情必须有人做”这种立场。');
            }
        }

        if (['ENFJ', 'INFJ', 'INFP', 'ISFP'].indexOf(type) !== -1) {
            if (high('apology')) {
                snippets.push('你在这一型里更偏向“亏欠型”：做了决定之后，仍会想对那个人说一句对不起。');
            }
            if (high('witness_memory') || high('face_response')) {
                snippets.push('你也更像那种不会让被牺牲者在心里消失的人。');
            }
        }

        if (['INTJ', 'ENFP', 'ENTP', 'INTP'].indexOf(type) !== -1) {
            if (high('system_fix')) {
                snippets.push('你在这一型里更偏向系统重构：最难接受的不是这次，而是它还会再次发生。');
            }
            if (high('decision_burden')) {
                snippets.push('你也更敏感于“为什么偏偏由我来决定”这层重量。');
            }
        }

        if (['ESTP', 'ISTP', 'ESFP', 'ISFJ'].indexOf(type) !== -1) {
            if (high('mercy_action')) {
                snippets.push('你在这一型里更偏向直接处置局面，哪怕代价是自己出手。');
            }
            if (high('face_response')) {
                snippets.push('但你也会被眼前那个具体的人强烈拉住。');
            }
        }

        if (!snippets.length) {
            return '';
        }

        return '<section class="flavor-note"><h3>补充侧写</h3><p>' + snippets.join('</p><p>') + '</p></section>';
    }

    function renderError(message, subtitleElement, contentElement) {
        // 错误状态下仍保留页面结构，只替换副标题和正文内容。
        subtitleElement.textContent = message;
        contentElement.innerHTML = '<p>' + message + '</p>';
    }

    $(function () {
        // 这些 DOM 节点是详情页渲染的核心出口，任何一个缺失都直接中止执行。
        var typeElement = document.getElementById('personality-type');
        var subtitleElement = document.getElementById('personality-subtitle');
        var contentElement = document.getElementById('personality-content');
        var personalityType = getQueryType();

        if (!typeElement || !subtitleElement || !contentElement) {
            return;
        }

        if (!personalityType) {
            renderError('缺少结果类型参数。', subtitleElement, contentElement);
            return;
        }

        // 统一从 JSON 读取人格正文，保证列表页和详情页使用同一份数据源。
        $.getJSON('./data/personality-content.json', function (personalities) {
            var personality = findPersonality(personalities, personalityType);

            if (!personality) {
                renderError('未找到对应结果。', subtitleElement, contentElement);
                return;
            }

            typeElement.textContent = personality.title || personality.type;
            subtitleElement.textContent = personality.subtitle || '结果详情';
            var flavorScores = {};
            try {
                flavorScores = JSON.parse(sessionStorage.getItem('trolleyFlavorScores') || '{}');
            } catch (error) {
                flavorScores = {};
            }

            var flavorSnippet = buildFlavorSnippet(personality.type, flavorScores);
            contentElement.innerHTML = (personality.contentHtml || '<p>暂无结果详情内容。</p>') + flavorSnippet;

            // 页面标题与 meta 描述跟随结果切换
            document.title = (personality.title || personality.type) + ' | 电车难题结果';
            updateMeta('meta[property="og:title"]', document.title);
            updateMeta('meta[property="og:description"]', personality.description || personality.subtitle || personality.title || '哲学画像详情');
            updateMeta('meta[name="description"]', personality.description || personality.subtitle || personality.title || '哲学画像详情');
        }).fail(function () {
            renderError('结果数据加载失败，请稍后重试。', subtitleElement, contentElement);
        });
    });
})();
