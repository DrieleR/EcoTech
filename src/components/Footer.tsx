import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-eco-blue px-6 py-10 mt-16 md:mt-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-sora text-lg font-black text-eco-cream-light">
            EcoTech
          </p>
          <p className="font-inter mt-1 text-sm text-white/70">
            Engenharia de Software na Amazônia
          </p>
        </div>

        <div className="flex flex-col gap-3 font-inter text-sm text-white/90">
          <span className="flex items-center gap-2">
            <Mail size={16} />
            contato@ecotech.com.br
          </span>
          <span className="flex items-center gap-2">
            <Phone size={16} />
            (91) 0000-0000
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={16} />
            UEPA — Campus Ananindeua, Pará
          </span>
        </div>
      </div>

      <p className="font-inter mt-8 text-center text-xs text-white/50">
        © {new Date().getFullYear()} EcoTech. Todos os direitos reservados.
      </p>
    </footer>
  );
};

export default Footer;