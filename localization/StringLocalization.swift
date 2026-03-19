//
//  StringLocalization.swift
//  fQRGen
//
//  String 확장: appLanguage 설정 기반 런타임 번역 지원
//

import Foundation

extension String {
    /// UserDefaults의 appLanguage 설정에 맞는 .lproj Bundle에서 번역을 로드합니다.
    /// AppKit 컴포넌트(NSAlert, NSMenuItem, NSSavePanel)에서 사용합니다.
    var localized: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "ko"
        guard let path = Bundle.main.path(forResource: lang, ofType: "lproj"),
              let bundle = Bundle(path: path) else {
            return self
        }
        return bundle.localizedString(forKey: self, value: nil, table: nil)
    }
}
