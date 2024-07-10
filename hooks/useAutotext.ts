import { useEffect, useState, useRef } from 'react'
// import { API } from '~/domains/library/constants/api'
// import { DocumentResponse } from '~/domains/library/@types/document'
// import { DIRECTORY } from '~/domains/library/constants/directory'
// import { useGetDirectory } from '~/domains/library/hooks/api/directory/useGetDirectory'
// import api from '~/services/api'

let worker: Worker | null = null;
  if (typeof window !== 'undefined') {
    worker = new Worker('/replacer.worker.js');
  }
export const useAutotext = () => {
  const [processedText, setProcessedText] = useState<string>('')
  const [replacements, setReplacements] = useState<
    { regex: RegExp; replace: string }[]
  >([])
  const [phrases, setPhrases] = useState<any[]>([])
  const replacementsRef = useRef(replacements) // Ref to keep the latest replacements

  // const { data: dataPhrase } = useGetDirectory(DIRECTORY.phrase)
  // const { data: dataMask } = useGetDirectory(DIRECTORY.mask)

  const dataPhrase:any = []
  const dataMask:any = []
  // useEffect(() => {
  //   if (dataPhrase && dataMask) {
  //     const localReplacements: { regex: RegExp; replace: string }[] = []
  //     const phrasesMask = recursivePhrases(dataMask?.items!)
  //     const phrasesPhrase = recursivePhrases(dataPhrase?.items!)
  //     const newPhrases = phrasesMask.concat(phrasesPhrase)
  //     setPhrases(newPhrases)
  //     const promises = newPhrases.map(
  //       async (pair: { target: string; uuid: string }) => {
  //         // const data = await api.get<DocumentResponse>(
  //         //   `${API.document}/${pair.uuid}`,
  //         // )

  //         return []
  //       },
  //     )

  //     Promise.all(promises).then((results) => {
  //       results.forEach((result:any) => {
  //         const regexString = `(auto|alto)(\\s*|-)(texto|testo)\\s*${result.data.shortcut}`
  //         localReplacements.push({
  //           regex: new RegExp(regexString, 'gi'),
  //           replace: result.data.text,
  //         })
  //       })
  //     })
  //     setReplacements(localReplacements)
  //   }
  // }, [dataPhrase,dataMask])

  useEffect(() => {
    replacementsRef.current = replacements
  }, [replacements])

  function hasAutotext(str: string) {
    return /(auto|alto)(\s*|-)(texto|testo)/gi.test(str)
  }

  function recursivePhrases(data: any[]): any[] {
    let result: any[] = []
    if(!data) return result
    data.forEach((item) => {
      if (item.shortcut) {
        result.push({
          target: item.shortcut,
          uuid: item.uuid,
        })
      }

      if (item.children) {
        result = result.concat(recursivePhrases(item.children))
      }
    })

    return result
  }

  const replaceText = (text: string) => {
    if (hasAutotext(text)) {
      if (worker) {
        worker.postMessage({ text, replacements: replacementsRef.current });

        worker.onmessage = function (event) {
          const processedText = event.data;
          setProcessedText(processedText);
        };
      } else {
        console.warn('Web Worker is not supported in this environment.');
        setProcessedText(text);
      }
    } else {
      setProcessedText(text);
    }
  };

  return { processedText, replaceText,phrases }
}
