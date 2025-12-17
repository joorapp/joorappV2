import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { map } from "lodash";
import { withTranslation } from "react-i18next";

import i18n from "../../../i18n";
import languages from "../../common/languages";

const LanguageDropdown: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState("en");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const lang =
      localStorage.getItem("I18N_LANGUAGE") || i18n.language || "en";
    setSelectedLang(lang);
  }, []);

  const changeLanguageAction = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("I18N_LANGUAGE", lang);
    setSelectedLang(lang);
  };

  const toggle = () => {
    setMenu(!menu);
  };

  return (
    <Dropdown isOpen={menu} toggle={toggle} className="d-inline-block">
      <DropdownToggle className="btn header-item " tag="button">
        <img
          src={(languages[selectedLang] || languages.en).flag}
          alt="JoorApp"
          height="16"
          className="me-1"
        />
      </DropdownToggle>
      <DropdownMenu className="language-switch dropdown-menu-end">
        {map(Object.keys(languages), (key) => {
          const lang = languages[key];
          return (
            <DropdownItem
              key={key}
              onClick={() => changeLanguageAction(key)}
              className={`notify-item ${selectedLang === key ? "active" : "none"
                }`}
            >
              <img
                src={lang.flag}
                alt="JoorApp"
                className="me-2"
                height="12"
              />
              <span className="align-middle">
                {lang.label}
              </span>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};

export default withTranslation()(LanguageDropdown);

