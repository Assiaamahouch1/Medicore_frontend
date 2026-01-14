import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  ChatbotService, 
  ChatMessage, 
  ChatbotStep, 
  ChatbotSearchRequest,
  ChatbotCabinetResult 
} from '../../../services/chatbot.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  // Chat state
  isChatOpen = false;
  isTyping = false;
  messages: ChatMessage[] = [];
  currentStep: ChatbotStep = 'welcome';
  userInput = '';

  // Search state
  searchRequest: ChatbotSearchRequest = {};
  specialites: string[] = [];
  villes: string[] = [];
  selectedCabinet: ChatbotCabinetResult | null = null;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private loadInitialData(): void {
    // Charger les spécialités et villes en parallèle
    this.chatbotService.getSpecialites().subscribe({
      next: (data) => this.specialites = data,
      error: (err) => console.error('Erreur spécialités:', err)
    });

    this.chatbotService.getVilles().subscribe({
      next: (data) => this.villes = data,
      error: (err) => console.error('Erreur villes:', err)
    });
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen && this.messages.length === 0) {
      this.startConversation();
    }
  }

  private startConversation(): void {
    this.addBotMessage(
      "Bonjour ! 👋 Je suis votre assistant MediCore. Je vais vous aider à trouver le médecin qu'il vous faut.",
      []
    );

    setTimeout(() => {
      this.currentStep = 'specialite';
      const options = this.specialites.length > 0 ? this.specialites : ['Généraliste', 'Dentiste', 'Pédiatre', 'Cardiologue'];
      this.addBotMessage("Quel type de médecin recherchez-vous ?", options);
    }, 1000);
  }

  selectOption(option: string): void {
    this.addUserMessage(option);

    switch (this.currentStep) {
      case 'specialite':
        this.searchRequest.specialite = option;
        this.askVille();
        break;
      case 'ville':
        this.searchRequest.ville = option;
        this.askNom();
        break;
      case 'nom':
        if (option === 'Je ne connais pas') {
          this.searchRequest.nomMedecin = undefined;
        } else {
          this.searchRequest.nomMedecin = option;
        }
        this.performSearch();
        break;
    }
  }

  private askVille(): void {
    setTimeout(() => {
      this.currentStep = 'ville';
      const options = this.villes.length > 0 ? this.villes : ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'];
      this.addBotMessage("Dans quelle ville recherchez-vous ?", options);
    }, 800);
  }

  private askNom(): void {
    setTimeout(() => {
      this.currentStep = 'nom';
      this.addBotMessage(
        "Connaissez-vous le nom d'un médecin ou d'un cabinet en particulier ?",
        ['Je ne connais pas']
      );
    }, 800);
  }

  submitUserInput(): void {
    if (!this.userInput.trim()) return;

    const input = this.userInput.trim();
    this.userInput = '';

    if (this.currentStep === 'nom') {
      this.addUserMessage(input);
      this.searchRequest.nomMedecin = input;
      this.performSearch();
    }
  }

  private performSearch(): void {
    this.isTyping = true;
    this.addBotMessage("Recherche en cours...", [], true);

    this.chatbotService.searchCabinets(this.searchRequest).subscribe({
      next: (response) => {
        this.isTyping = false;
        // Supprimer le message "Recherche en cours..."
        this.messages = this.messages.filter(m => !m.isTyping);

        if (response.success && response.cabinets.length > 0) {
          this.currentStep = 'results';
          this.addBotMessageWithCabinets(
            `${response.message} Voici les résultats :`,
            response.cabinets
          );
        } else {
          this.addBotMessage(
            "Désolé, aucun cabinet ne correspond à vos critères. Voulez-vous réessayer ?",
            ['Recommencer', 'Non merci']
          );
        }
      },
      error: (err) => {
        this.isTyping = false;
        this.messages = this.messages.filter(m => !m.isTyping);
        console.error('Erreur recherche:', err);
        this.addBotMessage(
          "Une erreur s'est produite. Voulez-vous réessayer ?",
          ['Recommencer', 'Non merci']
        );
      }
    });
  }

  selectCabinet(cabinet: ChatbotCabinetResult): void {
    this.selectedCabinet = cabinet;
    this.currentStep = 'details';
    this.addUserMessage(`J'aimerais en savoir plus sur ${cabinet.nom}`);

    setTimeout(() => {
      const horaires = cabinet.horairesDisponibles.slice(0, 5).join('\n• ');
      this.addBotMessage(
        `📍 **${cabinet.nom}**\n\n` +
        `🏥 Spécialité: ${cabinet.specialite || 'Non spécifié'}\n` +
        `📌 Adresse: ${cabinet.adresse || 'Non spécifié'}\n` +
        `🏙️ Ville: ${cabinet.ville || 'Non spécifié'}\n` +
        `📞 Contact: ${cabinet.tel || 'Non disponible'}\n\n` +
        `📅 **Prochains créneaux disponibles:**\n• ${horaires}\n\n` +
        `Pour prendre rendez-vous, veuillez contacter le secrétariat au ${cabinet.tel || 'numéro non disponible'}.`,
        ['Voir un autre cabinet', 'Recommencer', 'Merci !']
      );
    }, 800);
  }

  handleAction(action: string): void {
    this.addUserMessage(action);

    switch (action) {
      case 'Recommencer':
      case 'Voir un autre cabinet':
        this.resetConversation();
        break;
      case 'Non merci':
      case 'Merci !':
        setTimeout(() => {
          this.addBotMessage(
            "Merci d'avoir utilisé MediCore ! 😊 N'hésitez pas si vous avez d'autres questions.",
            ['Nouvelle recherche']
          );
        }, 500);
        break;
      case 'Nouvelle recherche':
        this.resetConversation();
        break;
    }
  }

  private resetConversation(): void {
    this.searchRequest = {};
    this.selectedCabinet = null;
    setTimeout(() => {
      this.currentStep = 'specialite';
      const options = this.specialites.length > 0 ? this.specialites : ['Généraliste', 'Dentiste', 'Pédiatre', 'Cardiologue'];
      this.addBotMessage("Quel type de médecin recherchez-vous ?", options);
    }, 500);
  }

  private addBotMessage(content: string, options: string[] = [], isTyping = false): void {
    this.messages.push({
      type: 'bot',
      content,
      timestamp: new Date(),
      options,
      isTyping
    });
  }

  private addBotMessageWithCabinets(content: string, cabinets: ChatbotCabinetResult[]): void {
    this.messages.push({
      type: 'bot',
      content,
      timestamp: new Date(),
      cabinets,
      options: ['Recommencer']
    });
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      type: 'user',
      content,
      timestamp: new Date()
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        this.chatMessagesContainer.nativeElement.scrollTop = 
          this.chatMessagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  closeChat(): void {
    this.isChatOpen = false;
  }
}
