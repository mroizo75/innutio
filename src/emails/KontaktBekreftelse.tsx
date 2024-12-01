import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Section,
  } from "@react-email/components";
  
  interface KontaktBekreftelseProps {
    navn: string;
    bedrift: string;
    melding: string;
  }
  
  export function KontaktBekreftelse({
    navn,
    bedrift,
    melding,
  }: KontaktBekreftelseProps) {
    return (
      <Html>
        <Head />
        <Preview>Takk for din henvendelse til InnUt.io</Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={h1}>Takk for din henvendelse</Heading>
            <Text style={text}>
              Hei {navn},
            </Text>
            <Text style={text}>
              Vi har mottatt din henvendelse og vil ta kontakt med deg så snart som mulig. 
              Under finner du en kopi av meldingen din.
            </Text>
            <Section style={messageBox}>
              <Text style={messageText}>{melding}</Text>
            </Section>
            <Text style={text}>
              Med vennlig hilsen,<br />
              Teamet i InnUt.io
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }
  
  const main = {
    backgroundColor: "#ffffff",
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
  };
  
  const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
  };
  
  const h1 = {
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "24px",
    margin: "16px 0",
  };
  
  const text = {
    color: "#374151",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "16px 0",
  };
  
  const messageBox = {
    backgroundColor: "#f3f4f6",
    borderRadius: "4px",
    padding: "16px",
    margin: "16px 0",
  };
  
  const messageText = {
    color: "#374151",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0",
  };