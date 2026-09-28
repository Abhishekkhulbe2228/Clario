// Parse raw backend trace strings into structured UI steps
export function parseTrace(traceStrings = []) {
  return traceStrings.map((raw, i) => {
    const step = { id: i, raw, icon: 'check', status: 'success', title: '', description: '' }

    if (/Router.*KB/i.test(raw)) {
      step.title = 'Question routed'
      step.description = 'Directed to Private HR Knowledge Base'
      step.icon = 'route'
    } else if (/Router.*DIRECT/i.test(raw)) {
      step.title = 'Question routed'
      step.description = 'Handled as a direct response (no retrieval needed)'
      step.icon = 'route'
    } else if (/Private KB retrieval/i.test(raw)) {
      const match = raw.match(/(\d+)\s*chunk/i)
      const n = match ? match[1] : '?'
      step.title = `Retrieved ${n} knowledge chunks`
      step.description = 'Searching private HR knowledge base'
      step.icon = 'search'
    } else if (/KB evidence grade.*GOOD/i.test(raw)) {
      step.title = 'Evidence evaluated'
      step.description = 'Private HR knowledge is sufficient'
      step.icon = 'check-circle'
      step.status = 'success'
    } else if (/KB evidence grade.*WEAK/i.test(raw)) {
      step.title = 'Private evidence insufficient'
      step.description = 'Company knowledge base did not have a confident answer'
      step.icon = 'alert-triangle'
      step.status = 'warning'
    } else if (/Web fallback/i.test(raw)) {
      step.title = 'Web search initiated'
      step.description = 'Searching trusted external sources via Tavily'
      step.icon = 'globe'
      step.status = 'info'
    } else if (/Web evidence grade.*GOOD/i.test(raw)) {
      step.title = 'Web evidence evaluated'
      step.description = 'External sources provide a reliable answer'
      step.icon = 'check-circle'
      step.status = 'success'
    } else if (/Web evidence grade.*WEAK/i.test(raw)) {
      step.title = 'Web evidence insufficient'
      step.description = 'External search did not return confident results'
      step.icon = 'alert-triangle'
      step.status = 'warning'
    } else if (/Query rewrite/i.test(raw)) {
      const rewritten = raw.replace(/Query rewrite\s*[→:]\s*/i, '').trim()
      step.title = 'Query rewritten'
      step.description = rewritten ? `Reformulated: "${rewritten}"` : 'Query reformulated for better retrieval'
      step.icon = 'refresh-cw'
      step.status = 'info'
    } else if (/Answer generation.*PRIVATE KB/i.test(raw)) {
      step.title = 'Answer generated'
      step.description = 'Grounded in company HR knowledge base'
      step.icon = 'sparkles'
      step.status = 'success'
    } else if (/Answer generation.*WEB SEARCH/i.test(raw)) {
      step.title = 'Answer generated'
      step.description = 'Based on external web sources'
      step.icon = 'sparkles'
      step.status = 'success'
    } else if (/Direct response/i.test(raw)) {
      step.title = 'Direct response'
      step.description = 'Answered directly without document retrieval'
      step.icon = 'message-circle'
      step.status = 'success'
    } else if (/Stopped.*insufficient/i.test(raw)) {
      step.title = 'Insufficient evidence'
      step.description = 'Could not find reliable evidence after all attempts'
      step.icon = 'x-circle'
      step.status = 'error'
    } else {
      step.title = raw
      step.description = ''
    }

    return step
  })
}

export function getSourceLabel(sourceUsed) {
  const map = {
    private_kb: { label: 'Internal HR Knowledge', icon: 'shield', color: 'blue' },
    web_search: { label: 'External Web Search', icon: 'globe', color: 'amber' },
    direct: { label: 'Direct Response', icon: 'message-circle', color: 'gray' },
    insufficient_evidence: { label: 'Insufficient Evidence', icon: 'alert-triangle', color: 'red' },
    kb: { label: 'Internal HR Knowledge', icon: 'shield', color: 'blue' },
    web: { label: 'External Web Search', icon: 'globe', color: 'amber' },
  }
  return map[sourceUsed] || { label: sourceUsed, icon: 'help-circle', color: 'gray' }
}

export function getAgentStages(sourceUsed) {
  const stages = {
    private_kb: [
      'Routing your question...',
      'Searching private HR knowledge...',
      'Evaluating evidence...',
      'Preparing your answer...',
    ],
    web_search: [
      'Routing your question...',
      'Searching private HR knowledge...',
      'Private knowledge was not sufficient.',
      'Checking trusted external sources...',
      'Evaluating external evidence...',
      'Preparing your answer...',
    ],
    direct: ['Understanding your message...', 'Preparing response...'],
    insufficient_evidence: [
      'Routing your question...',
      'Searching private HR knowledge...',
      'Checking external sources...',
      'Evidence insufficient — finalising response...',
    ],
  }
  return stages[sourceUsed] || stages.private_kb
}
