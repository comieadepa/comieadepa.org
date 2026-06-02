export const metadata = {
  title: "Política de Privacidade | COMIEADEPA",
  description: "Informações sobre privacidade e proteção de dados no portal da COMIEADEPA.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
