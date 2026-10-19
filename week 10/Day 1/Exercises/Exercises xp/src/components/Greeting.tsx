interface GreetingProps {
  name: string
  messageCount: number
}

export function Greeting({ name, messageCount }: GreetingProps) {
  return (
    <div className="greeting">
      <p>
        Hello, <strong>{name}</strong>!
      </p>
      <p className="supporting-text">
        You have {messageCount} new{' '}
        {messageCount === 1 ? 'message' : 'messages'}.
      </p>
    </div>
  )
}
