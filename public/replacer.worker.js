onmessage = (e) => {
    const { text, replacements } = e.data
    let processed = text;
    replacements.forEach((replacement) => {
        if (replacement.regex.test(processed)) {
            processed = processed.replace(replacement.regex, replacement.replace.replace(/<[^>]*>/g, ''));
        }
    });
    postMessage(processed);
};
