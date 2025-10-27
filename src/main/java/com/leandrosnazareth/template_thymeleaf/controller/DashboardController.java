package com.leandrosnazareth.template_thymeleaf.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("content", "index");
        return "layout/main";
    }

    @GetMapping("/usuarios")
    public String usuarios(Model model) {
        model.addAttribute("content", "usuarios");
        return "layout/main";
    }

    @GetMapping("/configuracoes")
    public String configuracoes(Model model) {
        model.addAttribute("content", "configuracoes");
        return "layout/main";
    }

    @GetMapping("/botoes")
    public String botoes(Model model) {
        model.addAttribute("content", "botoes");
        return "layout/main";
    }

    @GetMapping("/formularios")
    public String formularios(Model model) {
        model.addAttribute("content", "formularios");
        return "layout/main";
    }

    @GetMapping("/form-editor")
    public String formEditor(Model model) {
        model.addAttribute("content", "form-editor");
        return "layout/main";
    }

    @GetMapping("/graficos")
    public String graficos(Model model) {
        model.addAttribute("content", "graficos");
        return "layout/main";
    }

    @GetMapping("/tabelas")
    public String tabelas(Model model) {
        model.addAttribute("content", "tabelas");
        return "layout/main";
    }

    @GetMapping("/badges")
    public String badges(Model model) {
        model.addAttribute("content", "badges");
        return "layout/main";
    }

    @GetMapping("/accordion")
    public String accordion(Model model) {
        model.addAttribute("content", "accordion");
        return "layout/main";
    }

    @GetMapping("/alerts")
    public String alerts(Model model) {
        model.addAttribute("content", "alerts");
        return "layout/main";
    }


    @GetMapping("/my-profile")
    public String profile(Model model) {
        model.addAttribute("content", "my-profile");
        return "layout/main";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "forgot-password";
    }

    @GetMapping("/error-403")
    public String error403() {
        return "error-403";
    }

    @GetMapping("/error-404")
    public String error404() {
        return "error-404";
    }

    @GetMapping("/error-500")
    public String error500() {
        return "error-500";
    }
}
