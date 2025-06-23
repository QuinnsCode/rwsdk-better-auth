const AuthLayout = ({ children: children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-bg min-h-screen min-w-screen p-12">
      {children}
    </div>
  )
}

export { AuthLayout }