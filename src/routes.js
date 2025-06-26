// Material Dashboard 2 React page components (no layout imports)
import Tables from "./layouts/tables";
import Billing from "./layouts/billing";
import RTL from "./layouts/rtl";
import Notifications from "./layouts/notifications";
import Profile from "./layouts/profile";
import SignIn from "./layouts/authentication/sign-in";
import SignUp from "./layouts/authentication/sign-up";
import Map from "./layouts/map";
import Dashboard from "./layouts/dashboard";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import CityPage from "components/CityPage";
import { 
  Afghanistan, Albania, Algeria, AmericanSamoa, Andorra, Angola, Anguilla, Antarctica, AntiguaandBarbuda, Argentina, Armenia, Australia, Austria, Azerbaijan, Bahamas, Bahrain, Bangladesh, Barbados, Belarus, Belgium, Belize, Benin, Bhutan, Bolivia, BosniaandHerzegovina, Botswana, Brazil, BritishVirginIslands, BruneiDarussalam, Bulgaria, BurkinaFaso, Burundi, CaboVerde, Cambodia, Cameroon, Canada, CapeVerde, CentralAfricanRepublic, Chad, Chile, ChinaMainland, China, ChristmasIsland, CocosIslands, Colombia, Comoros, CongoBrazzaville, CongoKinshasa, CookIslands, CostaRica, CotedIvoire, Croatia, Cuba, Cyprus, CzechRepublic, Denmark, Djibouti, Dominica, DominicanRepublic, EastTimor, Ecuador, Egypt, ElSalvador, EquatorialGuinea, Eritrea, Estonia, Eswatini, Ethiopia, FalklandIslands, FederatedStatesofMicronesia, Fiji, Finland, France, FrenchGuiana, FrenchPolynesia, Gabon, Gambia, Georgia, Germany, Ghana, Greece, Greenland, Grenada, Guadeloupe, Guam, Guatemala, Guinea, GuineaBissau, Guyana, Haiti, Honduras, Hungary, Iceland, India, Indonesia, Iran, Iraq, Ireland, Israel, Italy, IvoryCoast, Jamaica, Japan, Jordan, Kazakhstan, Kenya, Kiribati, Kosovo, Kuwait, Kyrgyzstan, Laos, Latvia, Lebanon, Lesotho, Liberia, Libya, Liechtenstein, Lithuania, Luxembourg, Macedonia, Madagascar, Malawi, Malaysia, Maldives, Mali, Malta, Martinique, Mauritania, Mauritius, Mexico, Micronesia, Moldova, Monaco, Mongolia, Montenegro, Morocco, Mozambique, Myanmar, Namibia, Nauru, Nepal, Netherlands, NewCaledonia, NewZealand, Nicaragua, Niger, Nigeria, Niue, NorfolkIsland, NorthKorea, NorthMacedonia, Norway, Oman, Pakistan, Palau, Palestine, Panama, PapuaNewGuinea, Paraguay, Peru, Philippines, Poland, Portugal, Qatar, RepublicoftheSudan, Romania, Russia, Rwanda, SaintKittsandNevis, SaintLucia, Samoa, SanMarino, saotomeandprincipe, SaudiArabia, Senegal, Serbia, Seychelles, SierraLeone, Singapore, Slovakia, Slovenia, SolomonIslands, Somalia, SouthAfrica, SouthGeorgiaandtheSouthSandwichIslands, SouthKorea, SouthSudan, Spain, SriLanka, Sudan, StVincentandtheGrenadines, Suriname, SvalbardandJanMayen, Swaziland, Sweden, Switzerland, Syria, Taiwan, Tajikistan, Tanzania, Thailand, Togo, Tonga, TrinidadandTobago, Tunisia, Turkey, Turkmenistan, Tuvalu, Uganda, Ukraine, UnitedArabEmirates, UnitedKingdom, UnitedStates, Uruguay, Uzbekistan, Vanuatu, VaticanCity, Venezuela, Vietnam, WallisandFutunaIslands, WesternSahara, Yemen, Zambia, Zimbabwe
} from './components/countries';
import { AsiaPage } from "components/continent";

// @mui icons
import Icon from "@mui/material/Icon";

// Import Supabase client
import { supabase } from "./SupabaseClient"; // make sure the path is correct
import { LocationOn, ModeOfTravel } from "@mui/icons-material";

const routes = [
  /* {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: Dashboard,
  },*/ 
  {
    type: "collapse",
    name: "Destinations",
    key: "destinations",
    icon: <LocationOnIcon fontSize="small" />,
    flyout: false,
    children: [
      {
        type: "collapse",
        name: "Map",
        key: "map",
        icon: <PublicIcon fontSize="small" />,
        route: "/map",
        component: Map,
      },
      {
      type: "collapse",
        name: "World desitnations",
        key: "world-destinations",
        icon: <ModeOfTravel fontSize="small" />,
        flyout: true,
        
        children: [
          {
            type: "collapse",
            name: "Africa",
            key: "africa",
            flyout: true,
            children: [
              {name: "Algeria", key: "algeria", type: "collapse", route: "/Destinations/World_destinations/Africa/Algeria", component: Algeria},
              {name: "Angola", key: "angola", type: "collapse", route: "/Destinations/World_destinations/Africa/Angola", component: Angola},
              {name: "Benin", key: "benin", type: "collapse", route: "/Destinations/World_destinations/Africa/Benin", component: Benin},
              {name: "Botswana", key: "botswana", type: "collapse", route: "/Destinations/World_destinations/Africa/Botswana", component: Botswana},
              {name: "Burkina Faso", key: "burkinafaso", type: "collapse", route: "/Destinations/World_destinations/Africa/Burkina_Faso", component: BurkinaFaso},
              {name: "Burundi", key: "Burundi", type: "collapse", route: "/Destinations/World_destinations/Africa/Burundi", component: Burundi},
              {name: "Cameroon", key: "cameroon", type: "collapse", route: "/Destinations/World_destinations/Africa/Cameroon", component: Cameroon},
              {name: "Cape Verde", key: "capeverde", type: "collapse", route: "/Destinations/World_destinations/Africa/Cape_Verde", component: CapeVerde},
              {name: "Central African Republic", key: "centralafricanrepublic", type: "collapse", route: "/Destinations/World_destinations/Africa/Central_African_Republic", component: CentralAfricanRepublic},
              {name: "Chad", key: "chad", route: "/Destinations/World_destinations/Africa/Chad", component: Chad},
              {name: "Comoros", key: "comoros", route: "/Destinations/World_destinations/Africa/Comoros", component: Comoros},
              {name: "Côte d'lvoire", key: "cotedlvoire", route: "/Destinations/World_destinations/Africa/Côte_d'lvoire", component: CotedIvoire},
              {name: "Djibouti", key: "djibouti", route: "/Destinations/World_destinations/Africa/Djibouti", component: Djibouti},
              {name: "Eswatini", key: "eswatini", route: "/Destinations/World destionations/Africa/Eswatini", component: Eswatini},
              {name: "Egypt", key: "egypt", route: "/Destinations/World_destinations/Africa/Egypt", component: Egypt},
              {name: "Equatorial Guinea", key: "equatorial Guinea", route: "/Destinations/World_destinations/Africa/Equatorial_Guinea", component: EquatorialGuinea},
              {name: "Eritrea", key: "eritrea", route: "/Destinations/World_destinations/Africa/Eritrea", component: Eritrea},
              {name: "Ethiopia", key: "ethiopia", route: "/Destinations/World_destinations/Africa/Ethiopia", componen: Ethiopia},
              {name: "Gabon", key: "gabon", route: "/Destinations/World_destinations/Africa/Gabon", component: Gabon},
              {name: "Ghana", key: "ghana", route: "/Destinations/World_destinations/Africa/Ghana", component: Ghana},
              {name: "Guinea", key: "guinea", route: "/Destinations/World_destinations/Africa/Guinea", component: Guinea},
              {name: "Guinea-Bissau", key: "guineabissau", route: "/Destinations/World_destinations/Africa/Guinea-Bissau", component: GuineaBissau},
              {name: "Kenya", key: "kenya", route: "/Destinations/World_destinations/Africa/Kenya", component: Kenya},
              {name: "Lesotho", key: "lesotho", route: "/Destinations/World_destinations/Africa/Lesotho", component: Lesotho},
              {name: "Liberia", key: "liberia", route: "/Destinations/World_destinations/Africa/Liberia", component: Liberia},
              {name: "Libya", key: "libya", route: "/Destinations/World_destinations/Africa/Libya", component: Libya},
              {name: "Madagascar", key: "madagascar", route: "/Destinations/World_destinations/Africa/Madagascar", component: Madagascar},
              {name: "Malawi", key: "malawi", route: "/Destinations/World_destinations/Africa/Malawi", component: Malawi},
              {name: "Mali", key: "mali", route: "/Destinations/World_destinations/Africa/Mali", component: Mali},
              {name: "Mauritania", key: "mauritania", route: "/Destinations/World_destinations/Africa/Mouritania", component: Mauritania},
              {name: "Mauritius", key: "mauritius", route: "/Destinations/World_destinations/Africa/Mauritius", component: Mauritius},
              {name: "Morocco", key: "morocco", route: "/Destinations/World_destinations/Africa/Morocco", component: Morocco},
              {name: "Mozambique", key: "mozambique", route: "/Destinations/World_destinations/Africa/Mozambique", component: Mozambique},
              {name: "Namibia", key: "namibia", route: "/Destinations/World_destinations/Africa/Namibia", component: Namibia},
              {name: "Niger", key: "niger", route: "/Destinations/World_destinations/Africa/Niger", component: Niger},
              {name: "Nigeria", key: "nigeria", route: "/Destinations/World_destinations/Africa/Nigeria", component: Nigeria},
              {name: "Rwanda", key: "Rwanda", route: "/Destinations/World_destinations/Africa/Rwanda", component: Rwanda},
              {name: "São Tomé and Príncipe", key: "saotomeandprincipe", route: "/Destinations/World_destinations/Africa/São_Tomé_and_Príncipe", component: saotomeandprincipe},
              {name: "Senegal", key: "senegal", route: "/Destinations/World_destinations/Africa/Senegal", component: Senegal},
              {name: "Seychelles", key: "seychelles", routes: "/Destinations/World_destinations/Africa/Seychelles", component: Seychelles},
              {name: "Sierra Leone", key: "sierraleona", routes: "/Destinations/World_destinations/Africa/Sierra_Leone", component: SierraLeone},
              {name: "Somalia", key: "somalia", route: "/Destinations/World_destinations/Africa/Somalia", component: Somalia},
              {name: "South Africa", key: "southafrica", route: "/Destinations/World_destinations/Africa/South_Africa", component: SouthAfrica},
              {name: "Sudan", key: "sudan", route: "/Destinations/World_destinations/Africa/Sudan", component: Sudan},
              {name: "Tanzania", key: "tanzania", route: "/Destinations/World_destinations/Africa/Tanzania", component: Tanzania},
              {name: "Togo", key: "togo", route: "/Destinations/World_destinations/Africa/Togo", component: Togo},
              {name: "Tunisia", key: "tunisia", route: "/Destinations/World_destinations/Africa/Tunisia", component: Tunisia},
              {name: "Uganda", key: "uganda", route: "/Destinations/World_destinations/Africa/Uganda", component: Uganda},
              {name: "Zambia", key: "zambia", route: "/Destinations/World_destinations/Africa/Zambia", component: Zambia},
              {name: "Zimbabwe", key: "zimbabwe", route: "/Destinations/World_destinations/Africa/Zimbabwe", component: Zimbabwe}
            ]
          },
          {
            type: "collapse",
            name: "Antarctica",
            key: "antarctica",
            flyout: true,
            children: [
              {name: "Antarctica", key:" antarctica", route: "/Destinations/World_destinations/Antarctica/Antarctica", component: Antarctica,}
            ]
          },
          {
            type: "collapse",
            name: "Asia",
            key: "asia",
            route: "/Destinations/World_destinations/Asia",
            component: AsiaPage,
            flyout: true,
            children: [
              {name: "Afghanistan", key: "afghanistan", route: "/Destinations/World_destinations/Asia/Afghanistan", component: () => <Afghanistan countryName="Afghanistan" />},
              {name: "Azerbaijan", key: "azerbaijan", route: "/Destinations/World_destinations/Asia/Azerbaijan", component: Azerbaijan},
              {name: "Bangladesh", key: "bangladesh", route: "/Destinations/World_destinations/Asia/Bangladesh", component: Bangladesh},
              {name: "Bhutan", key: "bhutan", route: "/Destinations/World_destinations/Asia/Bhutan", component: Bhutan},
              {name: "Brunei", key: "brunei", route: "/Destinations/World_destinations/Asia/Brunei", component: BruneiDarussalam},
              {name: "Cambodia", key: "cambodia", route:"/Destinations/World_destinations/Asia/Cambodia", component: Cambodia},
              {name: "China", key: "china", route: "/Destinations/World_destinations/Asia/China", component: China},
              {name: "East Timor", key: "easttimor", route: "/Destinations/World_destinations/Asia/East_Timor", component: EastTimor},
              // {name: "Hong Kong", key: "hongkong", route: "/Destinations/World_destinations/Asia/Hong_Kong", component: Hongkong},
              {name: "India", key: "india", route: "/Destinations/World_destinations/Asia/India", component: India},
              {name: "Indonesia", key: "indonesia", route: "/Destinations/World_destinations/Asia/Indonesia", component: Indonesia},
              {name: "Japan" ,key: "japan", route: "/Destinations/World_destinations/Asia/Japan", component: Japan},
              {name: "Kazakhstan", key: "kazakhstan", route: "/Destinations/World_destinations/Asia/Kazakhstan", component: Kazakhstan},
              {name: "Kyrgyzstan", key: "kyrgyzstan", route: "/Destinations/World_destinations/Asia/Kyrgyzstan", component: Kyrgyzstan},
              {name: "Laos", key: "laos", route: "/Destinations/World_destinations/Asia/Laos", component: Laos},
              //{name: "Macau", key: "macau", route: "/Destinations/World_destinations/Asia/Macau", component: Macau},
              {name: "Malaysia", key: "malaysia", route: "/Destinations/World_destinations/Asia/Malaysia", component: Malaysia},
              {name: "Maldives", key: "maldives", route: "/Destinations/World_destinations/Asia/Maldives", component: Maldives},
              {name: "Mongolia", key: "mongolia", route: "/Destinations/World_destinations/Asia/Mongolia", component: Mongolia},
              {name: "Myanmar", key: "myanmar", route: "/Destinations/World_destinations/Asia/Myanmar", component: Myanmar},
              {name: "Nepal", key:"nepal", route: "/Destinations/World_destinations/Asia/Nepal", component: Nepal},
              {name: "North Korea", key: "northkorea", route: "/Destinations/World_destinations/Asia/North_Korea", component: NorthKorea},
              {name: "Pakistan", key: "pakistan", route: "/Destinations/World_destinations/Asia/Pakistan", component: Pakistan},
              {name: "Philippines", key: "philippines", route: "/Destinations/World_destinations/Asia/Philippines", component: Philippines},
              {name: "Singapore", key: "singapore", route: "/Destinations/World_destinations/Asia/Singapore", component: Singapore},
              {name: "South Korea", key: "southkorea", route: "/Destinations/World_destinations/Asia/South_Korea", component: SouthKorea},
              {name: "Sri Lanka", key: "srilanka", route: "/Destinations/World_destinations/Asia/Sri Lanka", component: SriLanka},
              {name: "Taiwan", key: "taiwan", route: "/Destinations/World_destinations/Asia/Taiwan", component: Taiwan},
              {name: "Tajikistan", key: "tajikistan", route: "/Destinations/World_destinations/Asia/tajikistan", component: Tajikistan},
              {name: "Thailand", key: "thailand", route: "/Destinations/World_destinations/Asia/Thailand", component: Thailand},
              //{name: "Tibet", key: "tibet", route: "/Destinations/World_destinations/Asia/Tibet", component: Tibet},
              {name: "Turkmenistan", key: "turkmenistan", route: "/Destinations/World_destinations/Asia/Turkmenistan", component: Turkmenistan},
              {name: "Uzbekistan", key: "uzbekistan", route: "/Destinations/World_destinations/Asia/Uzbekistan", component: Uzbekistan},
              {name: "Vietnam", key: "vietnam", route: "/Destinations/World_destinations/Asia/Vietnam", component: Vietnam}
            ]
          },
          {
            type: "collapse",
            name: "Caribbean",
            key: "caribbean",
            flyout: true,
            children: [
              {name: "Antigua and Barbuda", key: "antigua-and-barbuda", route: "/Destinations/World_destinations/Caribbean/Antigua_and_Barbuda", component: AntiguaandBarbuda},
              // {name: "Aruba", key: "aruba", route: "/Destinations/World_destinations/Caribbean/Aruba", component: Aruba},
              {name: "Bahamas", key: "bahamas", route: "/Destinations/World_destinations/Caribbean/Bahamas", component: Bahamas},
              {name: "Barbados", key: "barbados", route: "/Destinations/World_destinations/Caribbean/Barbados", component: Barbados},
              // {name: "Bermuda", key: "bermuda", route: "/Destinations/World_destinations/Caribbean/Bermuda", component: Bermuda},
              {name: "British Virgin Islands", key: "britishvirginislands", route: "/Destinations/World_destinations/Caribbean/British_Virgin_Islands", component: BritishVirginIslands},
              //{name: "Caribbean Netherlands", key: "caribbeannetherlands", route: "/Destinations/World_destinations/Caribbean/Caribbean_Netherlands", component: CaribbeanNetherlands},
              //{name: "Cayman Islands", key: "caymanislands", route: "/Destinations/World_destinations/Caribbean/Cayman_Islands", component: CaymanIslands},
              {name: "Cuba", key: "cuba", route: "/Destinations/World_destinations/Caribbean/Cuba", component: Cuba},
              //{name: "Curaçao", key: "curacao", route: "/Destinations/World_destinations/Caribbean/Curaçao", component: Curacao},
              {name: "Dominica", key: "dominica", route: "/Destinations/World_destinations/Caribbean/Dominica", component: Dominica},
              {name: "Dominican Republic", key: "dominicanrepublic", route: "/Destinations/World_destinations/Caribbean/Dominican_Republic", component: DominicanRepublic},
              {name: "Grenada", key: "grenada", route: "/Destinations/World_destinations/Caribbean/Grenada", component: Grenada},
              {name: "Guadeloupe", key: "guadeloupe", route: "/Destinations/World_destinations/Caribbean/Guadeloupe", component: Guadeloupe},
              {name: "Haiti", key: "haitit", route: "/Destinations/World_destinations/Caribbean/Haiti", component: Haiti},
              {name: "Jamaica", key: "jamaica", route: "/Destinations/World_destinations/Caribbean/Jamaica", component: Jamaica},
              {name: "Martinique", key: "martinique", route: "/Destinations/World_destinations/Caribbean/Martinique", component: Martinique},
              //{name: "Montserrat", key: "montserrat", route: "/Destinations/World_destinations/Caribbean/Montserrat", component: Montserrat},
              //{name: "Puerto Rico", key: "puertorico", route: "/Destinations/World_destinations/Caribbean/Puerto_Rico", component: PuertoRico},
              {name: "Saint Lucia", key: "saintlucia", route: "/Destinations/World_destinations/Caribbean/Saint Lucia", component: SaintLucia},
              //{name: "Saint Vincent and the Grenadines", key: "saintvincentandthegrenadines", route: "/Destinations/World_destinations/Caribbean/Saint_Vincent_and_the_Grenadines", component: SaintVincentandtheGrenadines},
              //{name: "Sint Maarten", key: "sintmaarten", route: "/Destinations/World_destinations/Caribbean/Sint_Maarten", component: SintMaarten},
              {name: "Trinidad and Tobago", key: "trinidadandtobago", route: "/Destinations/World_destinations/Caribbean/Trinidad and Tobago", component: TrinidadandTobago}
              //{name: "Turks and Caicos Islands", key: "turksandcaicosislands", route: "/Destinations/World_destinations/Caribbean/Turks_and_Caicos_Islands", component: TurksandCaicosIslands}
            ]
          },
          {
            type: "collapse",
            name: "Central America",
            key: "central-america",
            flyout: true,
            children: [
              {name: "Belize", key: "belize", route: "/Destinations/World_destinations/Central_America/Belize", component: Belize},
              {name: "Costa Rica", key: "costarica", route: "/Destinations/World_destinations/Central_America/Costa_Rica", component: CostaRica},
              {name: "El Salvador", key: "elsalvador", route: "/Destinations/World_destinations/Central_America/El_Salvador", component: ElSalvador},
              {name: "Guatemala", key: "guatemala", route: "/Destinations/World_destinations/Central_America/Guatemala", component: Guatemala},
              {name: "Honduras", key: "honduras", route: "/Destinations/World_destinations/Central_America/Honduras", component: Honduras},
              {name: "Nicaragua", key: "nicaragua", route: "/Destinations/World_destinations/Central_America/Nicaragua", component: Nicaragua},
              {name: "Panama", key: "panama", route: "/Destinations/World_destinations/Central_America/Panama", component: Panama}
            ]
          },
          {
            type: "collapse",
            name: "Europe",
            key: "europe",
            flyout: true,
            children: [
              //{name: "Åland Islands", key: "alandislands", route: "/Destinations/World_destinations/Europe/Åland Islands", component: AlandIslands},
              {name: "Albania", key: "albania", route: "/Destinations/World_destinations/Europe/Albania", component: () => <Albania countryName="Albania"/>},
              {name: "Andorra", key: "andorra", route: "/Destinations/World_destinations/Europe/Andorra", component: Andorra},
              {name: "Armenia", key: "armenia", route: "/Destinations/World_destinations/Europe/Armenia", component: Armenia},
              {name: "Austria", key: "austria", route: "/Destinations/World_destinations/Europe/Austria", component: Austria},
              {name: "Belarus", key: "belarus", route: "/Destinations/World_destinations/Europe/Belarus", component: Belarus},
              {name: "Belgium", key: "belgium", route: "/Destinations/World_destinations/Europe/Belgium", component: Belgium},
              {name: "Bosnia and Herzegovina", key: "bosniaandherzegovina", route: "/Destinations/World_destinations/Europe/Bosnia_and_Herzegovina", component: BosniaandHerzegovina},
              {name: "Bulgaria", key: "bulgaria", route: "/Destinations/World_destinations/Europe/Bulgaria", component: Bulgaria},
              //{name: "Crimea", key: "crimea", route: "/Destinations/World_destinations/Europe/Crimea", component: Crimea},
              {name: "Croatia", key: "croatia", route: "/Destinations/World_destinations/Europe/Croatia", component: Croatia},
              {name: "Cyprus", key: "cyprus", route: "/Destinations/World_destinations/Europe/Cyprus", component: Cyprus},
              {name: "Czechia", key: "czechia", route: "/Destinations/World_destinations/Europe/Czechia", component: CzechRepublic},
              {name: "Denmark", key: "denmark", route: "/Destinations/World_destinations/Europe/Denmark", component: Denmark},
              {name: "Estonia", key: "estonia", route: "/Destinations/World_destinations/Europe/Estiona", component: Estonia},
              //{name: "Faroe Islands", key: "faroeislands", route: "/Destinations/World_destinations/Europe/Faroe Islands", component: FaroeIslands},
              {name: "Finland", key: "finland", route: "/Destinations/World_destinations/Europe/Finland", component: Finland},
              {name: "France", key: "france", route: "/Destinations/World_destinations/Europe/France", component: France},
              {name: "Georgia", key: "georgia", route: "/Destinations/World_destinations/Europe/Georgia", component: Georgia},
              {name: "Germany", key: "germany", route: "/Destinations/World_destinations/Europe/Germany", component: Germany},
              {name: "Greece", key: "greece", route: "/Destinations/World_destinations/Europe/Greece", component: Greece},
              {name: "Greenland", key: "greenland", route: "/Destinations/World_destinations/Europe/Greenland", component: Greenland},
              //{name: "Guernsey", key: "guernsey", route: "/Destinations/World_destinations/Europe/Guernsey", component: Guernsey},
              {name: "Hungary", key: "hungary", route: "/Destinations/World_destinations/Europe/Hungary", component: Hungary},
              {name: "Iceland", key: "iceland", route: "/Destinations/World_destinations/Europe/Iceland", component: Iceland},
              {name: "Ireland", key: "ireland", route: "/Destinations/World_destinations/Europe/Ireland", component: Ireland},
              {name: "Italy", key: "italy", route: "/Destinations/World_destinations/Europe/Italy", component: Italy},
              //{name: "Jersey", key: "jersey", route: "/Destinations/World_destinations/Europe/Jersey", component: Jersey},
              {name: "Kosovo", key: "kosovo", route: "/Destinations/World_destinations/Europe/Kosovo", component: Kosovo},
              {name: "Latvia", key: "latvia", route: "/Destinations/World_destinations/Europe/Latvia", component: Latvia},
              {name: "Liechtenstein", key: "liechtenstein", route: "/Destinations/World_destinations/Europe/Liechtenstein", component: Liechtenstein},
              {name: "Lithuania", key: "lithuania", route: "/Destinations/World_destinations/Europe/Lithuania", component: Lithuania},
              {name: "Luxembourg", key: "luxembourg", route: "/Destinations/World_destinations/Europe/Luxembourg", component: Luxembourg},
              {name: "Malta", key: "malta", route: "/Destinations/World_destinations/Europe/Malta", component: Malta},
              {name: "Moldova", key: "moldova", route: "/Destinations/World_destinations/Europe/Moldova", component: Moldova},
              {name: "Monaco", key: "monaco", route: "/Destinations/World_destinations/Europe/Monaco", component: Monaco},
              {name: "Montenegro", key: "montenegro", route: "/Destinations/World_destinations/Europe/Montenegro", component: Montenegro},
              {name: "Netherlands", key: "amsterdam", route: "/Destinations/World_destinations/Europe/Netherlands", component: Netherlands},
              {name: "North Macedonia", key: "northmacedonia", route: "/Destinations/World_destinations/Europe/North_Macedonia", component: NorthMacedonia},
              {name: "Norway", key: "norway", route: "/Destinations/World_destinations/Europe/Norway", component: Norway},
              {name: "Poland", key: "poland", route: "/Destinations/World_destinations/Europe/Poland", component: Poland},
              {name: "Portugal", key: "portugal", route: "/Destinations/World_destinations/Europe/Portugal", component: Portugal},
              {name: "Romania", key: "romania", route: "/Destinations/World_destinations/Europe/Romania", component: Romania},
              {name: "Russia", key: "russia", route: "/Destinations/World_destinations/Europe/Russia", component: Russia},
              {name: "San Marino", key: "sanmarino", route: "/Destinations/World_destinations/Europe/San_Marino", component: SanMarino},
              {name: "Serbia", key: "serbia", route: "/Destinations/World_destinations/Europe/Serbia", component: Serbia},
              {name: "Slovakia", key: "slovakia", route: "/Destinations/World_destinations/Europe/Slovakia", component: Slovakia},
              {name: "Slovenia", key: "slovenia", route: "/Destinations/World_destinations/Europe/Slovenia", component: Slovenia},
              {name: "Spain", key: "spain", route: "/Destinations/World_destinations/Europe/Spain", component: Spain},
              {name: "Sweden", key: "sweden", route: "/Destinations/World_destinations/Europe/Sweden", component: Sweden},
              {name: "Switzerland", key: "switzerland", route: "/Destinations/World_destinations/Europe/Switzerland", component: Switzerland},
              {name: "Ukraine", key: "ukraine", route: "/Destinations/World_destinations/Europe/Ukraine", component: Ukraine},
              {name: "United Kingdom", key: "unitedkingdom", route: "/Destinations/World_destinations/Europe/United_Kingdom", component: UnitedKingdom},
              {name: "Vatican City", key: "vaticancity", route: "/Destinations/World_destinations/Europe/Vatican_City", component: VaticanCity}
            ]
          },
          {
            type: "collapse",
            name: "Middle East",
            key: "middle-east",
            flyout: true,
            children: [
              {name: "Bahrain", key: "bahrain", route: "/Destinations/World_destinations/Middle_East/Bahrain", component: Bahrain},
              //{name: "Golan", key: "golan", route: "/Destinations/World_destinations/Middle_East/Golan", component: Golan},
              {name: "Iran", key: "iran", route: "/Destinations/World_destinations/Middle_East/Iran", component: Iran},
              {name: "Iraq", key: "iraq", route: "/Destinations/World_destinations/Middle_East/Iraq", component: Iraq},
              {name: "Israel", key: "israel", route: "/Destinations/World_destinations/Middle_East/Israel", component: Israel},
              {name: "Jordan", key: "jordan", route: "/Destinations/World_destinations/Middle_East/Jordan", component: Jordan},
              {name: "Kuwait", key: "kuwait", route: "/Destinations/World_destinations/Middle_East/Kuwait", component: Kuwait},
              {name: "Lebanon", key: "lebanon", route: "/Destinations/World_destinations/Middle_East/Lebanon", component: Lebanon},
              {name: "Oman", key: "oman", route: "/Destinations/World_destinations/Middle_East/Oman", component: Oman},
              {name: "Qatar", key: "qatar", route: "/Destinations/World_destinations/Middle_East/Qatar", component: Qatar},
              {name: "Saudi Arabia", key: "saudiarabia", route: "/Destinations/World_destinations/Middle_East/Saudi_Arabia", component: SaudiArabia},
              {name: "Syria", key: "syria", route: "/Destinations/World_destinations/Middle_East/Syria", component: Syria},
              {name: "Turkey", key: "turkey", route: "/Destinations/World_destinations/Middle_East/Turkey", component: Turkey},
              {name: "United Arab Emirates", key: "unitedarabemirates", route: "/Destinations/World_destinations/Middle_East/United_Arab_Emirates", component: UnitedArabEmirates},
              {name: "Yemen", key: "yemen", route: "/Destinations/World_destinations/Middle_East/Yemen", component: Yemen}
            ]
          },
          {
            type: "collapse",
            name: "North America",
            key: "north-america",
            flyout: true,
            children: [
              {name: "Canada", key: "canada", route: "/Destinations/World_destinations/North_America/Canada", component: Canada},
              {name: "Mexico", key: "mexico", route: "/Destinations/World_destinations/North_America/Mexico", component: Mexico},
              {name: "United States", key: "unitedstates", route: "/Destinations/World_destinations/North_America/United_States", component: UnitedStates}
            ]
          },
          {
            type: "collapse",
            name: "Oceania",
            key: "oceania",
            flyout: true,
            children: [
              {name: "Australia", key: "australia", route: "/Destinations/World_destinations/Oceania/Australia", component: Australia},
              {name: "Fiji", key: "fiji", route: "/Destinations/World_destinations/Oceania/Fiji", component: Fiji},
              {name: "French Polynesia", key: "frenchpolynesia", route: "/Destinations/World_destinations/Oceania/French_Polynesia", component: FrenchPolynesia},
              //{name: "Marshall Islands", key: "marshallislands", route: "/Destinations/World_destinations/Oceania/Marshall_Islands", component: MarshallIslands},
              {name: "Micronesia", key: "micronesia", route: "/Destinations/World_destinations/Oceania/Micronesia", component: Micronesia},
              {name: "New Caledonia", key: "newcaledonia", route: "/Destinations/World_destinations/Oceania/New _aledonia", component: NewCaledonia},
              {name: "New Zealand", key: "newzealand", route: "/Destinations/World_destinations/Oceania/New Zealand", component: NewZealand},
              {name: "Palau", key: "palau", route: "/Destinations/World_destinations/Oceania/Palau", component: Palau},
              {name: "Papua New Guinea", key: "papuanewguinea", route: "/Destinations/World_destinations/Oceania/Papua_New_Guinea", component: PapuaNewGuinea},
              //{name: "Pitcairn Islands", key: "pitcairnislands", route: "/Destinations/World_destinations/Oceania/Pitcairn_Islands", component: PitcairnIslands},
              {name: "Samoa", key: "samoa", route: "/Destinations/World_destinations/Oceania/Samoa", component: Samoa},
              {name: "Solomon Islands", key: "solomonislands", route: "/Destinations/World_destinations/Oceania/Solomon_Islands", component: SolomonIslands},
              {name: "Tonga", key: "tonga", route: "/Destinations/World_destinations/Oceania/Tonga", component: Tonga},
              {name: "Tuvalu", key: "tuvalu", route: "/Destinations/World_destinations/Oceania/Tuvalu", component: Tuvalu},
              {name: "Vanuatu", key: "vanuatu", route: "/Destinations/World_destinations/Oceania/Vanuatu", component: Vanuatu}
            ]
          },
          {
            type: "collapse",
            name: "South America",
            key: "south-america",
            flyout: true,
            children: [
              {name: "Argentina", key: "argentina", route: "/Destinations/World_destinations/South_America/Argentina", component: Argentina},
              {name: "Bolivia", key: "bolivia", route: "/Destinations/World_destinations/South_America/Bolivia", component: Bolivia},
              {name: "Brazil", key: "brazil", route: "/Destinations/World_destinations/South_America/Brazil", component: Brazil},
              {name: "Chile", key: "chile", route: "/Destinations/World_destinations/South_America/Chile", component: Chile},
              {name: "Ecuador", key: "ecuador", route: "/Destinations/World_destinations/South_America/Ecuador", component: Ecuador},
              {name: "Falkland Islands", key: "falklandislands", route: "/Destinations/World_destinations/South_America/Falkland Islands", component: FalklandIslands},
              {name: "Guyana", key: "guyana", route: "/Destinations/World_destinations/South_America/Guyana", component: Guyana},
              {name: "Paraguay", key: "paraguay", route: "/Destinations/World_destinations/South_America/Paraguay", component: Paraguay},
              {name: "Peru", key: "peru", route: "/Destinations/World_destinations/South_America/Peru", component: Peru},
              {name: "Suriname", key: "suriname", route: "/Destinations/World_destinations/South_America/Suriname", component: Suriname},
              {name: "Uruguay", key: "uruguay", route: "/Destinations/World_destinations/South_America/Uruguay", component: Uruguay},
              {name: "Venezuela", key: "venezuala", route: "/Destinations/World_destinations/South_America/Venezuela", component: Venezuela}
            ]
          }
        ] // this is the end before this add 
      }
    ]
  },      
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: Profile,
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: Tables,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: Billing,
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: RTL,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: Notifications,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: SignIn,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: SignUp,
  },
  {
    type: "route",
    name: "City Page",
    key: "city",
    route: "/city/:cityId",
    component: CityPage,
  },
];

export default routes;
